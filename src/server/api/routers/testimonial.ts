import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { testimonials, forms } from '@/server/db/schema'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { triggerWebhooks } from '@/server/utils/webhook'

export const testimonialRouter = createTRPCRouter({
  createManual: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerCompany: z.string().optional(),
        customerPhoto: z.string().optional(),
        content: z.string().min(1),
        rating: z.number().min(1).max(5),
        status: z.enum(['pending', 'approved', 'rejected']),
        source: z.enum(['manual', 'form', 'api', 'import']).default('manual'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify form ownership
      const form = await ctx.db.query.forms.findFirst({
        where: and(
          eq(forms.id, input.formId),
          eq(forms.userId, ctx.userId)
        ),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' })
      }

      const testimonial = await ctx.db
        .insert(testimonials)
        .values({
          formId: input.formId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerCompany: input.customerCompany,
          customerPhoto: input.customerPhoto,
          content: input.content,
          rating: input.rating,
          status: input.status,
          source: input.source,
          approvedAt: input.status === 'approved' ? new Date() : null,
        })
        .returning()

      // Update form stats
      await ctx.db
        .update(forms)
        .set({
          submissions: sql`${forms.submissions} + 1`,
        })
        .where(eq(forms.id, input.formId))

      // Trigger webhook if approved
      if (input.status === 'approved') {
        triggerWebhooks(ctx.userId, 'approved', testimonial[0])
      }

      return testimonial[0]
    }),

  submit: publicProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        customerName: z.string().min(1).optional(),
        customerEmail: z.string().email().optional(),
        customerCompany: z.string().optional(),
        customerPhoto: z.string().optional(),
        content: z.string().min(10),
        rating: z.number().min(1).max(5),
        videoUrl: z.string().optional(),
        customAnswers: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get form to check settings
      const form = await ctx.db.query.forms.findFirst({
        where: eq(forms.id, input.formId),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Create testimonial
      const testimonial = await ctx.db
        .insert(testimonials)
        .values({
          formId: input.formId,
          customerName: input.customerName || 'Anonymous',
          customerEmail: input.customerEmail,
          customerCompany: input.customerCompany,
          customerPhoto: input.customerPhoto,
          content: input.content,
          rating: input.rating,
          videoUrl: input.videoUrl,
          customFields: input.customAnswers || {},
          status: form.config.settings.autoApprove ? 'approved' : 'pending',
          approvedAt: form.config.settings.autoApprove ? new Date() : null,
        })
        .returning()

      // Update form stats
      await ctx.db
        .update(forms)
        .set({
          submissions: sql`${forms.submissions} + 1`,
        })
        .where(eq(forms.id, input.formId))

      // Trigger webhook for new testimonial
      triggerWebhooks(form.userId, 'new_testimonial', testimonial[0])

      return testimonial[0]
    }),

  list: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid().optional(),
        status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user's forms
      const userForms = await ctx.db.query.forms.findMany({
        where: eq(forms.userId, ctx.userId),
        columns: { id: true },
      })

      const formIds = userForms.map((f) => f.id)

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

      // Trigger webhook for approved testimonial
      triggerWebhooks(ctx.userId, 'approved', updated[0])

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

      // Trigger webhook if testimonial is now featured
      if (updated[0]?.featured) {
        triggerWebhooks(ctx.userId, 'featured', updated[0])
      }

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

      const formIds = userForms.map((f) => f.id)

      const updated = await ctx.db
        .update(testimonials)
        .set({
          status: 'approved',
          approvedAt: new Date(),
        })
        .where(
          and(
            inArray(testimonials.id, input.ids),
            inArray(testimonials.formId, formIds)
          )
        )
        .returning()

      // Trigger webhooks for each approved testimonial
      updated.forEach((testimonial) => {
        triggerWebhooks(ctx.userId, 'approved', testimonial)
      })

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

      const formIds = userForms.map((f) => f.id)

      const deleted = await ctx.db
        .delete(testimonials)
        .where(
          and(
            inArray(testimonials.id, input.ids),
            inArray(testimonials.formId, formIds)
          )
        )
        .returning()

      return deleted
    }),

  bulkImport: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        testimonials: z.array(
          z.object({
            customerName: z.string(),
            customerEmail: z.string().optional(),
            customerCompany: z.string().optional(),
            customerPhoto: z.string().optional(),
            content: z.string(),
            rating: z.number().min(1).max(5),
            videoUrl: z.string().optional(),
            status: z.enum(['pending', 'approved', 'rejected']),
            source: z.enum(['form', 'api', 'import']),
            submittedAt: z.date().optional(),
            metadata: z.any().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify form ownership
      const form = await ctx.db.query.forms.findFirst({
        where: and(
          eq(forms.id, input.formId),
          eq(forms.userId, ctx.userId)
        ),
      })

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const results = {
        total: input.testimonials.length,
        success: 0,
        failed: 0,
        duplicates: 0,
      }

      // Check for duplicates based on email and content
      const existingTestimonials = await ctx.db.query.testimonials.findMany({
        where: eq(testimonials.formId, input.formId),
        columns: {
          customerEmail: true,
          content: true,
        },
      })

      const existingSet = new Set(
        existingTestimonials.map(
          (t) => `${t.customerEmail || ''}_${t.content.slice(0, 50)}`
        )
      )

      const testimonialsToInsert = []

      for (const testimonial of input.testimonials) {
        const key = `${testimonial.customerEmail || ''}_${testimonial.content.slice(0, 50)}`
        
        if (existingSet.has(key)) {
          results.duplicates++
          continue
        }

        testimonialsToInsert.push({
          formId: input.formId,
          ...testimonial,
          submittedAt: testimonial.submittedAt || new Date(),
          approvedAt: testimonial.status === 'approved' ? new Date() : null,
        })
      }

      if (testimonialsToInsert.length > 0) {
        try {
          await ctx.db.insert(testimonials).values(testimonialsToInsert)
          results.success = testimonialsToInsert.length
        } catch {
          results.failed = testimonialsToInsert.length
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to import testimonials',
          })
        }
      }

      // Update form submission count
      await ctx.db
        .update(forms)
        .set({
          submissions: sql`${forms.submissions} + ${results.success}`,
        })
        .where(eq(forms.id, input.formId))

      return results
    }),
})
