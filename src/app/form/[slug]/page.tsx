import { notFound } from 'next/navigation'
import { db, forms } from '@/server/db'
import { eq, sql } from 'drizzle-orm'
import { TestimonialForm } from '@/components/features/testimonial-form'

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic'

interface FormPageProps {
  params: Promise<{ slug: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params

  // Fetch form directly from DB (more reliable than tRPC in server components)
  const form = await db.query.forms.findFirst({
    where: eq(forms.slug, slug),
  })

  if (!form) {
    notFound()
  }

  // Track form view (non-blocking)
  db.update(forms)
    .set({ views: sql`${forms.views} + 1` })
    .where(eq(forms.id, form.id))
    .then(() => {})
    .catch(console.error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-2xl">
          <TestimonialForm form={form} />
        </div>
      </div>
    </div>
  )
}
