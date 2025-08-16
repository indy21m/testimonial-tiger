import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { forms } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const formConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'rating', 'select']),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })),
  settings: z.object({
    collectName: z.boolean(),
    collectEmail: z.boolean(),
    collectCompany: z.boolean(),
    collectPhoto: z.boolean(),
    collectVideo: z.boolean(),
    autoApprove: z.boolean(),
    redirectUrl: z.string().optional(),
    successMessage: z.string(),
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    primaryColor: z.string(),
    backgroundColor: z.string(),
    fontFamily: z.string(),
    borderRadius: z.string(),
    customCSS: z.string().optional(),
  }),
})

export const formRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      config: formConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db.insert(forms).values({
        userId: ctx.userId,
        name: input.name,
        config: input.config,
      }).returning()
      
      return form[0]
    }),
  
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(
          eq(forms.id, input.id),
          eq(forms.userId, ctx.userId)
        ),
      })
      
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      return form
    }),
  
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: eq(forms.slug, input.slug),
      })
      
      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      return form
    }),
  
  list: protectedProcedure.query(async ({ ctx }) => {
    const userForms = await ctx.db.query.forms.findMany({
      where: eq(forms.userId, ctx.userId),
      orderBy: (forms, { desc }) => [desc(forms.createdAt)],
    })
    
    return userForms
  }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      config: formConfigSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input
      
      const updated = await ctx.db
        .update(forms)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(
          eq(forms.id, id),
          eq(forms.userId, ctx.userId)
        ))
        .returning()
      
      if (!updated.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      return updated[0]
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(forms)
        .where(and(
          eq(forms.id, input.id),
          eq(forms.userId, ctx.userId)
        ))
        .returning()
      
      if (!deleted.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      
      return deleted[0]
    }),
})