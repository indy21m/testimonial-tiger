import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user) {
      // Create user if doesn't exist
      const newUser = await ctx.db
        .insert(users)
        .values({
          id: ctx.userId,
          email: '', // Will be updated from Clerk webhook
        })
        .returning()

      return newUser[0]
    }

    return user
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, ctx.userId))
        .returning()

      return updated[0]
    }),
})
