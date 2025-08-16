import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { testimonials, forms } from '@/server/db/schema'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const testimonialRouter = createTRPCRouter({
  submit: publicProcedure
    .input(z.object({
      formId: z.string().uuid(),
      customerName: z.string().min(1),
      customerEmail: z.string().email().optional(),
      customerCompany: z.string().optional(),
      customerPhoto: z.string().optional(),
      content: z.string().min(10),
      rating: z.number().min(1).max(5).optional(),
      videoUrl: z.string().optional(),
      customFields: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get form to check settings
      const form = await ctx.db.query.forms.findFirst({
        where: eq(forms.id, input.formId),
      })
      
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      // Create testimonial
      const testimonial = await ctx.db.insert(testimonials).values({
        ...input,
        status: form.config.settings.autoApprove ? 'approved' : 'pending',
        approvedAt: form.config.settings.autoApprove ? new Date() : null,
      }).returning()
      
      // Update form stats
      await ctx.db.update(forms)
        .set({
          submissions: sql`${forms.submissions} + 1`,
        })
        .where(eq(forms.id, input.formId))
      
      return testimonial[0]
    }),
  
  list: protectedProcedure
    .input(z.object({
      formId: z.string().uuid().optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Get user's forms
      const userForms = await ctx.db.query.forms.findMany({
        where: eq(forms.userId, ctx.userId),
        columns: { id: true },
      })
      
      const formIds = userForms.map(f => f.id)
      
      if (formIds.length === 0) {
        return { testimonials: [], total: 0 }
      }
      
      // Build where conditions
      const conditions = [inArray(testimonials.formId, formIds)]
      
      if (input.formId) {
        conditions.push(eq(testimonials.formId, input.formId))
      }
      
      if (input.status && input.status !== 'all') {
        conditions.push(eq(testimonials.status, input.status))
      }
      
      // TODO: Add full-text search when search is provided
      
      const results = await ctx.db.query.testimonials.findMany({
        where: and(...conditions),
        orderBy: [desc(testimonials.submittedAt)],
        limit: input.limit,
        offset: input.offset,
      })
      
      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(testimonials)
        .where(and(...conditions))
      
      return {
        testimonials: results,
        total: total[0]?.count ?? 0,
      }
    }),
  
  approve: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through form
      const testimonial = await ctx.db.query.testimonials.findFirst({
        where: eq(testimonials.id, input.id),
        with: { form: true },
      })
      
      if (!testimonial || testimonial.form.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      const updated = await ctx.db
        .update(testimonials)
        .set({
          status: 'approved',
          approvedAt: new Date(),
        })
        .where(eq(testimonials.id, input.id))
        .returning()
      
      return updated[0]
    }),
  
  reject: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through form
      const testimonial = await ctx.db.query.testimonials.findFirst({
        where: eq(testimonials.id, input.id),
        with: { form: true },
      })
      
      if (!testimonial || testimonial.form.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      const updated = await ctx.db
        .update(testimonials)
        .set({ status: 'rejected' })
        .where(eq(testimonials.id, input.id))
        .returning()
      
      return updated[0]
    }),
  
  toggleFeatured: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through form
      const testimonial = await ctx.db.query.testimonials.findFirst({
        where: eq(testimonials.id, input.id),
        with: { form: true },
      })
      
      if (!testimonial || testimonial.form.userId !== ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      const updated = await ctx.db
        .update(testimonials)
        .set({ featured: sql`NOT ${testimonials.featured}` })
        .where(eq(testimonials.id, input.id))
        .returning()
      
      return updated[0]
    }),
  
  bulkApprove: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through forms
      const userForms = await ctx.db.query.forms.findMany({
        where: eq(forms.userId, ctx.userId),
        columns: { id: true },
      })
      
      const formIds = userForms.map(f => f.id)
      
      const updated = await ctx.db
        .update(testimonials)
        .set({
          status: 'approved',
          approvedAt: new Date(),
        })
        .where(and(
          inArray(testimonials.id, input.ids),
          inArray(testimonials.formId, formIds)
        ))
        .returning()
      
      return updated
    }),
  
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through forms
      const userForms = await ctx.db.query.forms.findMany({
        where: eq(forms.userId, ctx.userId),
        columns: { id: true },
      })
      
      const formIds = userForms.map(f => f.id)
      
      const deleted = await ctx.db
        .delete(testimonials)
        .where(and(
          inArray(testimonials.id, input.ids),
          inArray(testimonials.formId, formIds)
        ))
        .returning()
      
      return deleted
    }),
})