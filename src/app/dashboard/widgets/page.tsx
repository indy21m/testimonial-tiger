'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/features/dashboard-nav'
import { Card } from '@/components/ui/card'
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Code,
  Eye,
  Layout,
  Layers,
  Grid,
  Badge,
  Square,
  MoreVertical,
  ExternalLink,
  Star,
} from 'lucide-react'
import { getWidgetEmbedCode, getWidgetPreviewUrl } from '@/lib/utils/widget-url'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const widgetTypeConfig = {
  wall: {
    icon: Layout,
    label: 'Wall',
    description: 'Display testimonials in a masonry wall layout',
    color: 'text-blue-600 bg-blue-100',
  },
  carousel: {
    icon: Layers,
    label: 'Carousel',
    description: 'Rotating testimonials with navigation controls',
    color: 'text-purple-600 bg-purple-100',
  },
  grid: {
    icon: Grid,
    label: 'Grid',
    description: 'Clean grid layout with equal-sized cards',
    color: 'text-green-600 bg-green-100',
  },
  single: {
    icon: Square,
    label: 'Single',
    description: 'Feature one testimonial at a time',
    color: 'text-orange-600 bg-orange-100',
  },
  badge: {
    icon: Badge,
    label: 'Badge',
    description: 'Compact rating badge with count',
    color: 'text-pink-600 bg-pink-100',
  },
}

export default function WidgetsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newWidgetName, setNewWidgetName] = useState('')
  const [newWidgetType, setNewWidgetType] = useState<
    'wall' | 'carousel' | 'grid' | 'single' | 'badge'
  >('wall')

  const { data: widgets, refetch } = api.widget.list.useQuery()

  const createMutation = api.widget.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateOpen(false)
      setNewWidgetName('')
      toast.success('Widget created successfully')
    },
    onError: () => {
      toast.error('Failed to create widget')
    },
  })

  const deleteMutation = api.widget.delete.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Widget deleted')
    },
    onError: () => {
      toast.error('Failed to delete widget')
    },
  })

  const duplicateMutation = api.widget.duplicate.useMutation({
    onSuccess: () => {
      refetch()
      toast.success('Widget duplicated')
    },
    onError: () => {
      toast.error('Failed to duplicate widget')
    },
  })

  const handleCreate = () => {
    if (!newWidgetName.trim()) {
      toast.error('Please enter a widget name')
      return
    }

    createMutation.mutate({
      name: newWidgetName,
      type: newWidgetType,
    })
  }

  const copyEmbedCode = (widgetId: string) => {
    const embedCode = getWidgetEmbedCode(widgetId)
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard')
  }

  const copyWidgetUrl = (widgetId: string) => {
    const url = getWidgetPreviewUrl(widgetId)
    navigator.clipboard.writeText(url)
    toast.success('Widget URL copied to clipboard')
  }

  const handleDelete = (widgetId: string) => {
    if (confirm('Are you sure you want to delete this widget?')) {
      deleteMutation.mutate({ id: widgetId })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Display Widgets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and customize widgets to showcase testimonials on your
              website
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Widget</DialogTitle>
                <DialogDescription>
                  Choose a widget type and give it a name
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Widget Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Homepage Testimonials"
                    value={newWidgetName}
                    onChange={(e) => setNewWidgetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Widget Type</Label>
                  <Select
                    value={newWidgetType}
                    onValueChange={(value: any) => setNewWidgetType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(widgetTypeConfig).map(
                        ([type, config]) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {widgetTypeConfig[newWidgetType].description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  Create Widget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Widgets Grid */}
        {!widgets || widgets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No widgets yet</h3>
            <p className="mb-4 text-gray-500">
              Create your first widget to start displaying testimonials
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Widget
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => {
              const typeConfig = widgetTypeConfig[widget.type]
              const Icon = typeConfig.icon

              return (
                <Card
                  key={widget.id}
                  className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg"
                >
                  <div className="p-6">
                    {/* Header with dropdown menu */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-3 ${typeConfig.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {widget.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <span className="capitalize">{widget.type}</span>
                            <span>•</span>
                            <span>
                              Edited{' '}
                              {widget.updatedAt
                                ? formatDistanceToNow(
                                    new Date(widget.updatedAt),
                                    { addSuffix: true }
                                  )
                                : 'recently'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/widgets/${widget.id}/edit`}
                              className="flex items-center"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyEmbedCode(widget.id)}
                          >
                            <Code className="mr-2 h-4 w-4" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyWidgetUrl(widget.id)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              duplicateMutation.mutate({ id: widget.id })
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(widget.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mini preview section */}
                    <Link href={`/dashboard/widgets/${widget.id}/edit`}>
                      <div className="mb-4 min-h-[120px] rounded-lg bg-gray-50 p-4 transition-colors group-hover:bg-gray-100 dark:bg-gray-800/50 dark:group-hover:bg-gray-800">
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <p className="mb-2 text-sm text-gray-500">
                              Wall of Love
                            </p>
                            <div className="flex justify-center -space-x-2">
                              {/* Sample avatar circles */}
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-semibold text-white">
                                JJ
                              </div>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-500 text-xs font-semibold text-white">
                                VG
                              </div>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-500 text-xs font-semibold text-white">
                                RR
                              </div>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-500 text-xs font-semibold text-white">
                                SR
                              </div>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs font-semibold text-gray-600">
                                +2
                              </div>
                            </div>
                            <div className="mt-2 flex justify-center">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Stats section */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Views</p>
                        <p className="text-lg font-semibold">
                          {(widget.impressions || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Engagements</p>
                        <p className="text-lg font-semibold">42</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Engagement rate</p>
                        <p className="text-lg font-semibold">3.1%</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link href={`/dashboard/widgets/${widget.id}/edit`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          duplicateMutation.mutate({ id: widget.id })
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(widget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
