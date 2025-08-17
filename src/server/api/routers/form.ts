import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'
import { forms } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const formConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['text', 'textarea', 'rating', 'select']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
  settings: z.object({
    requireEmail: z.boolean(),
    requireName: z.boolean(),
    allowVideo: z.boolean(),
    allowImage: z.boolean(),
    maxVideoLength: z.number(),
    autoApprove: z.boolean(),
    sendEmailNotification: z.boolean(),
    redirectUrl: z.string().optional(),
    successMessage: z.string(),
  }),
  styling: z.object({
    theme: z.enum(['minimal', 'modern', 'bold', 'custom']),
    primaryColor: z.string(),
    backgroundColor: z.string(),
    fontFamily: z.string(),
    borderRadius: z.enum(['none', 'small', 'medium', 'large']),
    showLogo: z.boolean(),
    logoUrl: z.string().optional(),
  }),
})

export const formRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        config: formConfigSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use default config if not provided
      const defaultConfig = {
        title: "We'd love your feedback!",
        description: 'Share your experience with our product',
        questions: [],
        settings: {
          requireName: true,
          requireEmail: true,
          allowImage: true,
          allowVideo: false,
          maxVideoLength: 60,
          autoApprove: false,
          sendEmailNotification: true,
          successMessage: 'Thank you for your feedback!',
        },
        styling: {
          theme: 'modern' as const,
          primaryColor: '#3b82f6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 'medium' as const,
          showLogo: false,
        },
      }

      const form = await ctx.db
        .insert(forms)
        .values({
          userId: ctx.userId,
          name: input.name,
          config: input.config || defaultConfig,
        })
        .returning()

      return form[0]
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.query.forms.findFirst({
        where: and(eq(forms.id, input.id), eq(forms.userId, ctx.userId)),
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
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        config: formConfigSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const updated = await ctx.db
        .update(forms)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(forms.id, id), eq(forms.userId, ctx.userId)))
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
        .where(and(eq(forms.id, input.id), eq(forms.userId, ctx.userId)))
        .returning()

      if (!deleted.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return deleted[0]
    }),

  trackView: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(forms)
        .set({
          views: sql`${forms.views} + 1`,
        })
        .where(eq(forms.id, input.id))

      return { success: true }
    }),
})
