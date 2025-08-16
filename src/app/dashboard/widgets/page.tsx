'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Copy, Trash2, Code, Eye, Layout, Layers, Grid, Badge, Square } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  const [newWidgetType, setNewWidgetType] = useState<'wall' | 'carousel' | 'grid' | 'single' | 'badge'>('wall')
  const [embedCodeWidgetId, setEmbedCodeWidgetId] = useState<string>()

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
    const embedCode = `<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${window.location.origin}/widget/${widgetId}.js" async></script>`
    
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied to clipboard')
    setEmbedCodeWidgetId(undefined)
  }

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
            <Link href="/dashboard/testimonials" className="text-gray-600 dark:text-gray-400">
              Testimonials
            </Link>
            <Link href="/dashboard/widgets" className="font-medium">
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
            <h1 className="text-3xl font-bold">Display Widgets</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and customize widgets to showcase testimonials on your website
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
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
                  <Select value={newWidgetType} onValueChange={(value: any) => setNewWidgetType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(widgetTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {widgetTypeConfig[newWidgetType].description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  Create Widget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Widgets Grid */}
        {!widgets || widgets.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Layout className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first widget to start displaying testimonials
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Widget
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => {
              const typeConfig = widgetTypeConfig[widget.type]
              const Icon = typeConfig.icon
              
              return (
                <Card key={widget.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                        >
                          <Link href={`/dashboard/widgets/${widget.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEmbedCodeWidgetId(widget.id)}
                            >
                              <Code className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          {embedCodeWidgetId === widget.id && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Embed Code</DialogTitle>
                                <DialogDescription>
                                  Copy this code to embed the widget on your website
                                </DialogDescription>
                              </DialogHeader>
                              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                <code className="text-sm whitespace-pre">
{`<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widget.id}"></div>
<script src="${window.location.origin}/widget/${widget.id}.js" async></script>`}
                                </code>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => copyEmbedCode(widget.id)}>
                                  Copy to Clipboard
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    </div>
                    <CardTitle className="mt-3">{widget.name}</CardTitle>
                    <CardDescription>
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {typeConfig.label}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Impressions</span>
                        <span className="font-medium">{(widget.impressions || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Created</span>
                        <span className="font-medium">
                          {widget.createdAt ? formatDistanceToNow(new Date(widget.createdAt), { addSuffix: true }) : 'Recently'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/dashboard/widgets/${widget.id}/edit`}>
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateMutation.mutate({ id: widget.id })}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this widget?')) {
                              deleteMutation.mutate({ id: widget.id })
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}