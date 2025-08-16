import { createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'
import { formRouter } from '@/server/api/routers/form'
import { testimonialRouter } from '@/server/api/routers/testimonial'
import { widgetRouter } from '@/server/api/routers/widget'
import { integrationRouter } from '@/server/api/routers/integration'

export const appRouter = createTRPCRouter({
  user: userRouter,
  form: formRouter,
  testimonial: testimonialRouter,
  widget: widgetRouter,
  integration: integrationRouter,
})

export type AppRouter = typeof appRouter
