'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Sparkles, Grid3x3, Image, Star, Badge } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const widgetTypes = [
  {
    type: 'wall' as const,
    name: 'Testimonial Wall',
    description: 'Display multiple testimonials in a responsive grid',
    icon: Grid3x3,
  },
  {
    type: 'carousel' as const,
    name: 'Carousel',
    description: 'Rotating testimonials with navigation controls',
    icon: Image,
  },
  {
    type: 'grid' as const,
    name: 'Grid Layout',
    description: 'Fixed 3-column grid of testimonials',
    icon: Grid3x3,
  },
  {
    type: 'single' as const,
    name: 'Single Testimonial',
    description: 'Feature one testimonial at a time',
    icon: Star,
  },
  {
    type: 'badge' as const,
    name: 'Rating Badge',
    description: 'Compact badge showing average rating',
    icon: Badge,
  },
]

export default function NewWidgetPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<'wall' | 'carousel' | 'grid' | 'single' | 'badge'>('wall')
  const [isCreating, setIsCreating] = useState(false)

  const createMutation = api.widget.create.useMutation({
    onSuccess: (widget) => {
      toast.success('Widget created successfully')
      if (widget) {
        router.push(`/dashboard/widgets/${widget.id}/edit`)
      }
    },
    onError: () => {
      toast.error('Failed to create widget')
      setIsCreating(false)
    },
  })

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a widget name')
      return
    }

    setIsCreating(true)
    createMutation.mutate({
      name: name.trim(),
      type: selectedType,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/widgets">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Create New Widget</h1>
              <p className="text-sm text-gray-500">Choose a widget type and customize it</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl p-8">
        <div className="space-y-8">
          {/* Widget Name */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Name</CardTitle>
              <CardDescription>Give your widget a descriptive name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="widget-name">Name</Label>
                <Input
                  id="widget-name"
                  placeholder="e.g., Homepage Testimonials"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Widget Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Type</CardTitle>
              <CardDescription>Select the display format for your testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {widgetTypes.map((widget) => {
                  const Icon = widget.icon
                  return (
                    <button
                      key={widget.type}
                      onClick={() => setSelectedType(widget.type)}
                      className={cn(
                        'relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
                        selectedType === widget.type
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-lg',
                          selectedType === widget.type
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{widget.name}</h3>
                        <p className="text-xs text-gray-500">{widget.description}</p>
                      </div>
                      {selectedType === widget.type && (
                        <div className="absolute right-2 top-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/widgets">Cancel</Link>
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Widget
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}