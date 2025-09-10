'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/features/dashboard-nav'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestimonialCard } from '@/components/features/testimonial-card'
import { TestimonialFilters } from '@/components/features/testimonial-filters'
import { Download, CheckCircle, Trash2, Plus } from 'lucide-react'

export default function TestimonialsPage() {
  const [status, setStatus] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all')
  const [selectedForm, setSelectedForm] = useState<string>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data: forms } = api.form.list.useQuery()
  const { data: testimonialData, refetch } = api.testimonial.list.useQuery({
    status,
    formId: selectedForm,
    search: searchTerm,
  })

  const approveMutation = api.testimonial.approve.useMutation({
    onSuccess: () => refetch(),
  })

  const rejectMutation = api.testimonial.reject.useMutation({
    onSuccess: () => refetch(),
  })

  const toggleFeaturedMutation = api.testimonial.toggleFeatured.useMutation({
    onSuccess: () => refetch(),
  })

  const bulkApproveMutation = api.testimonial.bulkApprove.useMutation({
    onSuccess: () => {
      setSelectedIds([])
      refetch()
    },
  })

  const bulkDeleteMutation = api.testimonial.bulkDelete.useMutation({
    onSuccess: () => {
      setSelectedIds([])
      refetch()
    },
  })

  const handleSelectAll = () => {
    if (selectedIds.length === testimonialData?.testimonials.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(testimonialData?.testimonials.map((t) => t.id) || [])
    }
  }

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const exportTestimonials = () => {
    if (!testimonialData?.testimonials) return

    const csv = [
      ['Name', 'Email', 'Company', 'Rating', 'Content', 'Status', 'Date'],
      ...testimonialData.testimonials.map((t) => [
        t.customerName,
        t.customerEmail || '',
        t.customerCompany || '',
        t.rating?.toString() || '',
        t.content,
        t.status,
        t.submittedAt ? new Date(t.submittedAt).toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `testimonials-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const testimonials = testimonialData?.testimonials || []
  const total = testimonialData?.total || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Testimonials</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and moderate customer testimonials
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/testimonials/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </Link>
            <Button onClick={exportTestimonials} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-2xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {
                  testimonials.filter(
                    (t) => t.status === 'pending' || t.status === null
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {testimonials.filter((t) => t.status === 'approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Featured</CardDescription>
              <CardTitle className="text-2xl text-purple-600">
                {testimonials.filter((t) => t.featured).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <TestimonialFilters
          forms={forms || []}
          selectedForm={selectedForm}
          onFormChange={setSelectedForm}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Tabs */}
        <Tabs
          value={status}
          onValueChange={(v) =>
            setStatus(v as 'all' | 'pending' | 'approved' | 'rejected')
          }
        >
          <div className="mb-4 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    bulkApproveMutation.mutate({ ids: selectedIds })
                  }
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve ({selectedIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    bulkDeleteMutation.mutate({ ids: selectedIds })
                  }
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>

          <TabsContent value={status} className="space-y-4">
            {testimonials.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">No testimonials found</p>
              </Card>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === testimonials.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Select all {testimonials.length} testimonials
                  </span>
                </div>

                {/* Testimonial List */}
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      isSelected={selectedIds.includes(testimonial.id)}
                      onSelect={() => handleSelect(testimonial.id)}
                      onApprove={() =>
                        approveMutation.mutate({ id: testimonial.id })
                      }
                      onReject={() =>
                        rejectMutation.mutate({ id: testimonial.id })
                      }
                      onToggleFeatured={() =>
                        toggleFeaturedMutation.mutate({ id: testimonial.id })
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
