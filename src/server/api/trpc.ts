import { initTRPC, TRPCError } from '@trpc/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db, users } from '@/server/db'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { eq } from 'drizzle-orm'

interface CreateContextOptions {
  headers: Headers
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const { userId } = await auth()

  return {
    db,
    userId,
    headers: opts.headers,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Ensure user exists in database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, ctx.userId),
  })

  if (!existingUser) {
    // Get user details from Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    // Create user in database
    try {
      await db.insert(users).values({
        id: ctx.userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.firstName
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : null,
      })
    } catch (error) {
      // User might already exist, that's fine
      console.log('User already exists or error creating user:', error)
    }
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  })
})

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
