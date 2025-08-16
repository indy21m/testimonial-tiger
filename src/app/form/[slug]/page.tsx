import { notFound } from 'next/navigation'
import { api } from '@/lib/trpc/server'
import { TestimonialForm } from '@/components/features/testimonial-form'

interface FormPageProps {
  params: Promise<{ slug: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params
  
  // Fetch form by slug - this is a public endpoint
  const form = await api.form.getBySlug.query({ slug })
  
  if (!form) {
    notFound()
  }

  // Track form view
  await api.form.trackView.mutate({ id: form.id })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <TestimonialForm form={form} />
        </div>
      </div>
    </div>
  )
}