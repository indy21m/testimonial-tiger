import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { integrations, webhookLogs } from '@/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const integrationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(['zapier', 'webhook']),
        name: z.string().min(1),
        config: z.object({
          webhookUrl: z.string().url().optional(),
          apiKey: z.string().optional(),
          triggers: z.array(
            z.enum(['new_testimonial', 'approved', 'featured'])
          ),
          headers: z.record(z.string(), z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const integration = await ctx.db
        .insert(integrations)
        .values({
          userId: ctx.userId,
          type: input.type,
          name: input.name,
          config: input.config,
        })
        .returning()

      return integration[0]
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userIntegrations = await ctx.db.query.integrations.findMany({
      where: eq(integrations.userId, ctx.userId),
      orderBy: [desc(integrations.createdAt)],
    })

    return userIntegrations
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        config: z
          .object({
            webhookUrl: z.string().url().optional(),
            apiKey: z.string().optional(),
            triggers: z
              .array(z.enum(['new_testimonial', 'approved', 'featured']))
              .optional(),
            headers: z.record(z.string(), z.string()).optional(),
          })
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, config, ...updates } = input

      const updateData: Record<string, unknown> = { ...updates }
      if (config) {
        updateData.config = {
          ...config,
          triggers: config.triggers ?? [],
        }
      }

      const updated = await ctx.db
        .update(integrations)
        .set(updateData)
        .where(
          and(eq(integrations.id, id), eq(integrations.userId, ctx.userId))
        )
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
        .delete(integrations)
        .where(
          and(
            eq(integrations.id, input.id),
            eq(integrations.userId, ctx.userId)
          )
        )
        .returning()

      if (!deleted.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return deleted[0]
    }),

  getLogs: protectedProcedure
    .input(
      z.object({
        integrationId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const integration = await ctx.db.query.integrations.findFirst({
        where: and(
          eq(integrations.id, input.integrationId),
          eq(integrations.userId, ctx.userId)
        ),
      })

      if (!integration) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const logs = await ctx.db.query.webhookLogs.findMany({
        where: eq(webhookLogs.integrationId, input.integrationId),
        orderBy: [desc(webhookLogs.createdAt)],
        limit: input.limit,
      })

      return logs
    }),
})
