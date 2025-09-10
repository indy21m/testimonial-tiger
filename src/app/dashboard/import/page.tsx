'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface SenjaTestimonial {
  id: string
  type: 'text' | 'video'
  text: string
  rating?: number
  customerName?: string
  customerEmail?: string
  customerAvatar?: string
  customerCompany?: string
  customerTagline?: string
  date: string
  approved: boolean
  videoUrl?: string
  url?: string
  tags?: string[]
}

export default function ImportPage() {
  const [apiKey, setApiKey] = useState('')
  const [selectedFormId, setSelectedFormId] = useState<string>()
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    failed: number
    duplicates: number
  }>()
  const [senjaTestimonials, setSenjaTestimonials] = useState<
    SenjaTestimonial[]
  >([])
  const [isFetching, setIsFetching] = useState(false)

  const { data: forms } = api.form.list.useQuery()

  const importMutation = api.testimonial.bulkImport.useMutation({
    onSuccess: (results) => {
      setImportResults(results)
      toast.success(`Successfully imported ${results.success} testimonials`)
      setSenjaTestimonials([])
      setApiKey('')
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`)
    },
    onSettled: () => {
      setIsImporting(false)
      setImportProgress(0)
    },
  })

  const fetchSenjaTestimonials = async () => {
    if (!apiKey) {
      toast.error('Please enter your Senja API key')
      return
    }

    setIsFetching(true)
    try {
      const response = await fetch('https://api.senja.io/v1/testimonials', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()

      // Map Senja data structure to our format
      // Try multiple possible field structures
      const testimonials: SenjaTestimonial[] =
        data.testimonials?.map((t: any) => {
          return {
            id: t.id,
            type: t.type || 'text',
            text: t.text || '',
            rating: t.rating || 5,
            // Try all possible name field locations
            customerName:
              t.customer_name ||
              t.customerName ||
              t.name ||
              t.customer?.name ||
              'Anonymous',
            // Try all possible email field locations
            customerEmail:
              t.customer_email ||
              t.customerEmail ||
              t.email ||
              t.customer?.email,
            // Try all possible avatar field locations
            customerAvatar:
              t.customer_avatar ||
              t.customerAvatar ||
              t.avatar ||
              t.customer?.avatar,
            // Try all possible company field locations
            customerCompany:
              t.customer_company ||
              t.customerCompany ||
              t.company ||
              t.customer?.company,
            // Try all possible tagline field locations
            customerTagline:
              t.customer_tagline ||
              t.customerTagline ||
              t.tagline ||
              t.customer?.tagline,
            date: t.date || t.created_at || new Date().toISOString(),
            approved: t.approved !== false,
            videoUrl: t.video_url || t.videoUrl || t.video?.url,
            url: t.url,
            tags: t.tags || [],
          }
        }) || []

      setSenjaTestimonials(testimonials)
      toast.success(`Found ${testimonials.length} testimonials from Senja`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch testimonials'
      )
    } finally {
      setIsFetching(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFormId) {
      toast.error('Please select a form to import into')
      return
    }

    if (senjaTestimonials.length === 0) {
      toast.error('No testimonials to import')
      return
    }

    setIsImporting(true)

    // Map Senja testimonials to our format
    const testimonialsToImport = senjaTestimonials.map((t) => ({
      customerName: t.customerName || 'Anonymous',
      customerEmail: t.customerEmail,
      customerPhoto: t.customerAvatar,
      customerCompany: t.customerCompany,
      content: t.text,
      rating: t.rating || 5,
      videoUrl: t.videoUrl,
      status: t.approved ? ('approved' as const) : ('pending' as const),
      source: 'import' as const,
      submittedAt: new Date(t.date),
      metadata: {
        senjaId: t.id,
        importedAt: new Date().toISOString(),
        sourceUrl: t.url,
        tags: t.tags,
        customerTagline: t.customerTagline,
        type: t.type,
      },
    }))

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setImportProgress((prev) => Math.min(prev + 10, 90))
    }, 200)

    try {
      await importMutation.mutateAsync({
        formId: selectedFormId,
        testimonials: testimonialsToImport,
      })
      clearInterval(progressInterval)
      setImportProgress(100)
    } catch {
      clearInterval(progressInterval)
      setImportProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          {/* Import Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Connect to your Senja account and import your testimonials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Senja API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Senja API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isFetching || isImporting}
                  />
                  <Button
                    onClick={fetchSenjaTestimonials}
                    disabled={!apiKey || isFetching || isImporting}
                  >
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Find your API key in Senja project settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form">Import Into Form</Label>
                <Select
                  value={selectedFormId}
                  onValueChange={setSelectedFormId}
                  disabled={isImporting}
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
            </CardContent>
          </Card>

          {/* Testimonials Preview */}
          {senjaTestimonials.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ready to Import</CardTitle>
                    <CardDescription>
                      {senjaTestimonials.length} testimonials found
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFormId || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import All
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isImporting && (
                  <div className="mb-6 space-y-2">
                    <Progress value={importProgress} />
                    <p className="text-center text-sm text-gray-500">
                      Importing testimonials... {importProgress}%
                    </p>
                  </div>
                )}

                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {senjaTestimonials.slice(0, 10).map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-800"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {testimonial.customerAvatar ? (
                            <img
                              src={testimonial.customerAvatar}
                              alt={testimonial.customerName}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {testimonial.customerName || 'Anonymous'}
                            </p>
                            {testimonial.customerCompany && (
                              <p className="text-xs text-gray-600">
                                {testimonial.customerCompany}
                              </p>
                            )}
                            {testimonial.customerEmail && (
                              <p className="text-xs text-gray-500">
                                {testimonial.customerEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {testimonial.rating && (
                            <Badge variant="secondary">
                              {testimonial.rating}★
                            </Badge>
                          )}
                          {testimonial.type === 'video' && (
                            <Badge variant="outline">Video</Badge>
                          )}
                          <Badge
                            variant={
                              testimonial.approved ? 'default' : 'secondary'
                            }
                          >
                            {testimonial.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.text}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(testimonial.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {senjaTestimonials.length > 10 && (
                    <p className="py-2 text-center text-sm text-gray-500">
                      And {senjaTestimonials.length - 10} more...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResults && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{importResults.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {importResults.success}
                    </p>
                    <p className="text-sm text-gray-500">Imported</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {importResults.duplicates}
                    </p>
                    <p className="text-sm text-gray-500">Duplicates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {importResults.failed}
                    </p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <Button asChild>
                    <Link href="/dashboard/testimonials">
                      View Testimonials
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
