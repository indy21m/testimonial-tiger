import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client'
import { headers } from 'next/headers'
import { type AppRouter } from '@/server/api/root'
import superjson from 'superjson'
import { cache } from 'react'

const createClient = cache(() => {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === 'development' ||
          (op.direction === 'down' && op.result instanceof Error),
      }),
      httpBatchLink({
        transformer: superjson,
        url: getBaseUrl() + '/api/trpc',
        async headers() {
          const heads = new Headers(await headers())
          heads.set('x-trpc-source', 'rsc')
          return heads
        },
      }),
    ],
  })
})

export const api = createClient()

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}