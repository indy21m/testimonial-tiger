'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/features/dashboard-nav'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/trpc/client'

export default function NewFormPage() {
  const router = useRouter()
  const [formName, setFormName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const createForm = api.form.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        router.push(`/dashboard/forms/${data.id}/edit`)
      }
    },
  })

  const handleCreate = async () => {
    if (!formName.trim()) return

    setIsCreating(true)
    createForm.mutate({
      name: formName,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create New Form</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start collecting testimonials with a beautiful form
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
              <CardDescription>
                Give your form a name to get started. You can customize
                everything else later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Form Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Feedback Form"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate()
                    }
                  }}
                />
                <p className="text-sm text-gray-500">
                  This is for your reference only. Your customers won&apos;t see
                  this.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreate}
                  disabled={!formName.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Form'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/forms')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates (Future Enhancement) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Start Templates</CardTitle>
              <CardDescription>
                Coming soon: Start with a pre-built template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
                  <span className="text-2xl">⭐</span>
                  <p className="mt-2 font-medium">Product Review</p>
                  <p className="text-sm text-gray-500">
                    Perfect for e-commerce
                  </p>
                </div>
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
                  <span className="text-2xl">💼</span>
                  <p className="mt-2 font-medium">Service Feedback</p>
                  <p className="text-sm text-gray-500">For B2B services</p>
                </div>
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
                  <span className="text-2xl">🎓</span>
                  <p className="mt-2 font-medium">Course Testimonial</p>
                  <p className="text-sm text-gray-500">For online courses</p>
                </div>
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
                  <span className="text-2xl">🏥</span>
                  <p className="mt-2 font-medium">Patient Testimonial</p>
                  <p className="text-sm text-gray-500">For healthcare</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
