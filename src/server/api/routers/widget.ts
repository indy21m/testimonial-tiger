import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { widgets, testimonials } from '@/server/db/schema'
import { eq, and, desc, gte, inArray } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

const widgetConfigSchema = z.object({
  display: z.object({
    showRating: z.boolean(),
    showDate: z.boolean(),
    showPhoto: z.boolean(),
    showCompany: z.boolean(),
    maxLength: z.number().optional(),
    itemsPerPage: z.number().optional(),
  }),
  filters: z.object({
    formIds: z.array(z.string()).optional(),
    onlyFeatured: z.boolean(),
    minRating: z.number().optional(),
    maxItems: z.number().optional(),
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'custom']),
    layout: z.enum(['compact', 'comfortable', 'spacious']),
    primaryColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    borderColor: z.string(),
    borderRadius: z.string(),
    shadow: z.enum(['none', 'sm', 'md', 'lg']),
    fontFamily: z.string(),
    customCSS: z.string().optional(),
  }),
})

export const widgetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(['wall', 'carousel', 'grid', 'single', 'badge']),
        config: widgetConfigSchema.optional(),
        allowedDomains: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const widget = await ctx.db
        .insert(widgets)
        .values({
          userId: ctx.userId,
          name: input.name,
          type: input.type,
          config: input.config,
          allowedDomains: input.allowedDomains,
        })
        .returning()

      return widget[0]
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const widget = await ctx.db.query.widgets.findFirst({
        where: and(eq(widgets.id, input.id), eq(widgets.userId, ctx.userId)),
      })

      if (!widget) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return widget
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userWidgets = await ctx.db.query.widgets.findMany({
      where: eq(widgets.userId, ctx.userId),
      orderBy: (widgets, { desc }) => [desc(widgets.createdAt)],
    })

    return userWidgets
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        type: z
          .enum(['wall', 'carousel', 'grid', 'single', 'badge'])
          .optional(),
        config: widgetConfigSchema.optional(),
        allowedDomains: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const updated = await ctx.db
        .update(widgets)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(widgets.id, id), eq(widgets.userId, ctx.userId)))
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
        .delete(widgets)
        .where(and(eq(widgets.id, input.id), eq(widgets.userId, ctx.userId)))
        .returning()

      if (!deleted.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return deleted[0]
    }),

  // Get testimonials for a widget (for preview)
  getTestimonials: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const widget = await ctx.db.query.widgets.findFirst({
        where: and(
          eq(widgets.id, input.widgetId),
          eq(widgets.userId, ctx.userId)
        ),
      })

      if (!widget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Widget not found',
        })
      }

      // Build filter conditions
      const conditions = [eq(testimonials.status, 'approved')]
      
      if (widget.config.filters.formIds && widget.config.filters.formIds.length > 0) {
        conditions.push(inArray(testimonials.formId, widget.config.filters.formIds))
      }
      
      if (widget.config.filters.onlyFeatured) {
        conditions.push(eq(testimonials.featured, true))
      }
      
      if (widget.config.filters.minRating) {
        conditions.push(gte(testimonials.rating, widget.config.filters.minRating))
      }

      const limit = widget.config.filters.maxItems || 20

      const widgetTestimonials = await ctx.db.query.testimonials.findMany({
        where: and(...conditions),
        orderBy: [desc(testimonials.submittedAt)],
        limit,
        with: {
          form: {
            columns: {
              name: true,
            },
          },
        },
      })

      return widgetTestimonials
    }),

  // Duplicate a widget
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const widget = await ctx.db.query.widgets.findFirst({
        where: and(
          eq(widgets.id, input.id),
          eq(widgets.userId, ctx.userId)
        ),
      })

      if (!widget) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Widget not found',
        })
      }

      const [newWidget] = await ctx.db
        .insert(widgets)
        .values({
          userId: ctx.userId,
          name: `${widget.name} (Copy)`,
          type: widget.type,
          config: widget.config,
          allowedDomains: widget.allowedDomains,
        })
        .returning()

      return newWidget
    }),
})
