import { db, widgets, testimonials } from '@/server/db'
import { eq, and, desc, gte, inArray } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WidgetPreview } from '@/components/features/widget-preview'

export default async function WidgetPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Get widget configuration
  const widget = await db.query.widgets.findFirst({
    where: eq(widgets.id, id),
  })

  if (!widget) {
    notFound()
  }

  let widgetTestimonials = []

  // Check if specific testimonials are selected
  if (
    widget.config.filters.selectedTestimonialIds &&
    widget.config.filters.selectedTestimonialIds.length > 0
  ) {
    // Fetch only selected testimonials
    const selectedTestimonials = await db.query.testimonials.findMany({
      where: and(
        eq(testimonials.status, 'approved'),
        inArray(testimonials.id, widget.config.filters.selectedTestimonialIds)
      ),
    })

    // Sort testimonials according to custom order if provided
    if (
      widget.config.filters.testimonialOrder &&
      widget.config.filters.testimonialOrder.length > 0
    ) {
      const orderMap = new Map(
        widget.config.filters.testimonialOrder.map((id, index) => [id, index])
      )
      widgetTestimonials = selectedTestimonials.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 999
        const orderB = orderMap.get(b.id) ?? 999
        return orderA - orderB
      })
    } else {
      widgetTestimonials = selectedTestimonials
    }
  } else {
    // Fall back to filter-based selection
    const conditions = [eq(testimonials.status, 'approved')]

    if (
      widget.config.filters.formIds &&
      widget.config.filters.formIds.length > 0
    ) {
      conditions.push(
        inArray(testimonials.formId, widget.config.filters.formIds)
      )
    }

    if (widget.config.filters.onlyFeatured) {
      conditions.push(eq(testimonials.featured, true))
    }

    if (widget.config.filters.minRating) {
      conditions.push(gte(testimonials.rating, widget.config.filters.minRating))
    }

    const limit = widget.config.filters.maxItems || 20

    widgetTestimonials = await db.query.testimonials.findMany({
      where: and(...conditions),
      orderBy: [desc(testimonials.submittedAt)],
      limit,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{widget.name}</h1>
          <p className="text-gray-600">Widget Preview</p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
          <WidgetPreview widget={widget} testimonials={widgetTestimonials} />
        </div>
      </div>
    </div>
  )
}
