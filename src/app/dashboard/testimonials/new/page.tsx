'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { api } from '@/lib/trpc/client'
import { DashboardNav } from '@/components/features/dashboard-nav'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewTestimonialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    formId: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerPhoto: '',
    content: '',
    rating: 5,
    status: 'approved' as 'pending' | 'approved' | 'rejected',
  })

  const { data: forms } = api.form.list.useQuery()

  const createMutation = api.testimonial.createManual.useMutation({
    onSuccess: () => {
      toast.success('Testimonial created successfully')
      router.push('/dashboard/testimonials')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create testimonial')
      setIsSubmitting(false)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.formId || !formData.customerName || !formData.content) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    createMutation.mutate({
      ...formData,
      source: 'manual',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mx-auto max-w-2xl">
          {/* Page Header */}
          <div className="mb-6">
            <Link href="/dashboard/testimonials">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Testimonials
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Add Testimonial</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manually add a testimonial to your collection
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Testimonial Details</CardTitle>
                <CardDescription>
                  Fill in the customer information and testimonial content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Form Selection */}
                <div className="space-y-2">
                  <Label htmlFor="form">
                    Form <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.formId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, formId: value })
                    }
                  >
                    <SelectTrigger id="form">
                      <SelectValue placeholder="Select a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms?.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Customer Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Customer Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="john@example.com"
                  />
                </div>

                {/* Customer Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.customerCompany}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerCompany: e.target.value,
                      })
                    }
                    placeholder="Acme Corp"
                  />
                </div>

                {/* Customer Photo URL */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input
                    id="photo"
                    type="url"
                    value={formData.customerPhoto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhoto: e.target.value,
                      })
                    }
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {/* Testimonial Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Testimonial Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="This product is amazing..."
                    rows={4}
                    required
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">
                    Rating: {formData.rating} stars
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="rating"
                      min={1}
                      max={5}
                      step={1}
                      value={[formData.rating]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rating: value[0] || 5 })
                      }
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl ${
                            star <= formData.rating
                              ? 'text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: 'pending' | 'approved' | 'rejected'
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end gap-4">
              <Link href="/dashboard/testimonials">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Testimonial'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
