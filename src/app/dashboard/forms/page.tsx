'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/trpc/client'

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: forms, isLoading } = api.form.list.useQuery()

  const filteredForms =
    forms?.filter((form) =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? []

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
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400"
            >
              Dashboard
            </Link>
            <Link href="/dashboard/forms" className="font-medium">
              Forms
            </Link>
            <Link
              href="/dashboard/testimonials"
              className="text-gray-600 dark:text-gray-400"
            >
              Testimonials
            </Link>
            <Link
              href="/dashboard/widgets"
              className="text-gray-600 dark:text-gray-400"
            >
              Widgets
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Forms</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your testimonial collection forms
            </p>
          </div>
          <Link href="/dashboard/forms/new">
            <Button>Create New Form</Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Forms Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="mb-4 text-gray-500">
                {searchTerm
                  ? 'No forms found matching your search.'
                  : 'No forms created yet.'}
              </p>
              <Link href="/dashboard/forms/new">
                <Button>Create Your First Form</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card key={form.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{form.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {form.config.title}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {form.submissions || 0} submissions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Views</span>
                      <span className="font-medium">{form.views || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Conversion</span>
                      <span className="font-medium">
                        {form.views && form.views > 0 && form.submissions
                          ? `${((form.submissions / form.views) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex gap-2 border-t pt-3">
                      <Link
                        href={`/dashboard/forms/${form.id}/edit`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Edit
                        </Button>
                      </Link>
                      <Link
                        href={`/form/${form.slug}`}
                        target="_blank"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
