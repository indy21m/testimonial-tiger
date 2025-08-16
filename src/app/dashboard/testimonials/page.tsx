'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TestimonialCard } from '@/components/features/testimonial-card'
import { TestimonialFilters } from '@/components/features/testimonial-filters'
import { Download, CheckCircle, Trash2 } from 'lucide-react'

export default function TestimonialsPage() {
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
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
      setSelectedIds(testimonialData?.testimonials.map(t => t.id) || [])
    }
  }

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const exportTestimonials = () => {
    if (!testimonialData?.testimonials) return

    const csv = [
      ['Name', 'Email', 'Company', 'Rating', 'Content', 'Status', 'Date'],
      ...testimonialData.testimonials.map(t => [
        t.customerName,
        t.customerEmail || '',
        t.customerCompany || '',
        t.rating?.toString() || '',
        t.content,
        t.status,
        t.submittedAt ? new Date(t.submittedAt).toLocaleDateString() : '',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

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
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐅</span>
            <span className="text-xl font-bold">Testimonial Tiger</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400">
              Dashboard
            </Link>
            <Link href="/dashboard/forms" className="text-gray-600 dark:text-gray-400">
              Forms
            </Link>
            <Link href="/dashboard/testimonials" className="font-medium">
              Testimonials
            </Link>
            <Link href="/dashboard/widgets" className="text-gray-600 dark:text-gray-400">
              Widgets
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Testimonials</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and moderate customer testimonials
            </p>
          </div>
          <Button onClick={exportTestimonials} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
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
                {testimonials.filter(t => t.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {testimonials.filter(t => t.status === 'approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Featured</CardDescription>
              <CardTitle className="text-2xl text-purple-600">
                {testimonials.filter(t => t.featured).length}
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
        <Tabs value={status} onValueChange={(v) => setStatus(v as 'all' | 'pending' | 'approved' | 'rejected')}>
          <div className="flex justify-between items-center mb-4">
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
                  onClick={() => bulkApproveMutation.mutate({ ids: selectedIds })}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve ({selectedIds.length})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => bulkDeleteMutation.mutate({ ids: selectedIds })}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
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
                      onApprove={() => approveMutation.mutate({ id: testimonial.id })}
                      onReject={() => rejectMutation.mutate({ id: testimonial.id })}
                      onToggleFeatured={() => toggleFeaturedMutation.mutate({ id: testimonial.id })}
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