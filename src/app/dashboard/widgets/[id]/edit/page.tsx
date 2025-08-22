'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Monitor, Smartphone, Eye, GripVertical, Upload, X, Code } from 'lucide-react'
import { toast } from 'sonner'
import { debounce } from 'lodash'
import { WidgetPreview } from '@/components/features/widget-preview'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { upload } from '@vercel/blob/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable testimonial item component
function SortableTestimonialItem({ testimonial, isSelected, onToggle }: {
  testimonial: any
  isSelected: boolean
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: testimonial.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800"
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{testimonial.customerName}</p>
        <p className="text-xs text-gray-500 truncate">{testimonial.content}</p>
      </div>
      {testimonial.rating && (
        <div className="text-xs text-yellow-500">
          {testimonial.rating}★
        </div>
      )}
    </div>
  )
}

export default function WidgetEditorPage() {
  const params = useParams()
  const router = useRouter()
  const widgetId = params.id as string
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('testimonials')
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false)
  const [selectedTestimonialIds, setSelectedTestimonialIds] = useState<string[]>([])
  const [testimonialOrder, setTestimonialOrder] = useState<string[]>([])
  const [truncateLength, setTruncateLength] = useState(200)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: widget, refetch } = api.widget.get.useQuery({ id: widgetId })
  const { data: forms } = api.form.list.useQuery()
  const { data: allTestimonials, refetch: refetchAllTestimonials } = api.widget.getAllTestimonials.useQuery({ widgetId })
  const { refetch: refetchFilteredTestimonials } = api.widget.getTestimonials.useQuery({ widgetId })
  const utils = api.useUtils()

  const updateMutation = api.widget.update.useMutation({
    onSuccess: async () => {
      await refetch()
      await refetchAllTestimonials()
      await refetchFilteredTestimonials()
      // Also invalidate the queries to ensure fresh data
      await utils.widget.getAllTestimonials.invalidate({ widgetId })
      await utils.widget.getTestimonials.invalidate({ widgetId })
      toast.success('Widget settings saved')
    },
    onError: () => {
      toast.error('Failed to save widget settings')
    },
  })

  // Debounced update for smooth editing experience
  const debouncedUpdate = useMemo(
    () => debounce((updates: any) => {
      updateMutation.mutate({ id: widgetId, ...updates })
    }, 500),
    [widgetId]
  )

  const handleConfigUpdate = useCallback((path: string[], value: any, immediate: boolean = false) => {
    if (!widget) return

    const newConfig = { ...widget.config }
    let current: any = newConfig
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (key !== undefined) {
        current = current[key]
      }
    }
    
    const lastKey = path[path.length - 1]
    if (lastKey !== undefined) {
      current[lastKey] = value
    }

    if (immediate) {
      updateMutation.mutate({ id: widgetId, config: newConfig })
    } else {
      debouncedUpdate({ config: newConfig })
    }
  }, [widget, debouncedUpdate, widgetId])

  const handleDomainsUpdate = useCallback((domains: string) => {
    const domainList = domains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0)
    
    debouncedUpdate({ allowedDomains: domainList })
  }, [debouncedUpdate])

  // Initialize selected testimonials and order from widget config
  useEffect(() => {
    if (widget?.config.filters.selectedTestimonialIds) {
      setSelectedTestimonialIds(widget.config.filters.selectedTestimonialIds)
    }
    if (widget?.config.filters.testimonialOrder) {
      setTestimonialOrder(widget.config.filters.testimonialOrder)
    } else if (allTestimonials) {
      // Initialize order with all testimonials if not set
      setTestimonialOrder(allTestimonials.map(t => t.id))
    }
    // Initialize truncate length
    if (widget?.config.display.truncateLength) {
      setTruncateLength(widget.config.display.truncateLength)
    }
  }, [widget, allTestimonials])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setTestimonialOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        // Update widget config, preserving selectedTestimonialIds
        debouncedUpdate({ 
          config: {
            ...widget!.config,
            filters: {
              ...widget!.config.filters,
              selectedTestimonialIds: selectedTestimonialIds,
              testimonialOrder: newOrder
            }
          }
        })
        
        return newOrder
      })
    }
  }

  const toggleTestimonial = (testimonialId: string) => {
    setSelectedTestimonialIds(prev => {
      const newIds = prev.includes(testimonialId)
        ? prev.filter(id => id !== testimonialId)
        : [...prev, testimonialId]
      
      // Update widget config
      debouncedUpdate({ 
        config: {
          ...widget!.config,
          filters: {
            ...widget!.config.filters,
            selectedTestimonialIds: newIds,
            testimonialOrder: testimonialOrder
          }
        }
      })
      
      return newIds
    })
    
    // Add to order if not present
    if (!testimonialOrder.includes(testimonialId)) {
      setTestimonialOrder(prev => [...prev, testimonialId])
    }
  }

  const toggleAll = () => {
    if (!allTestimonials) return
    
    const allSelected = selectedTestimonialIds.length === allTestimonials.length
    const newIds = allSelected ? [] : allTestimonials.map(t => t.id)
    
    setSelectedTestimonialIds(newIds)
    
    // Update order to include all testimonials if selecting all
    if (!allSelected) {
      const currentOrder = testimonialOrder
      const missingIds = newIds.filter(id => !currentOrder.includes(id))
      setTestimonialOrder([...currentOrder, ...missingIds])
    }
    
    debouncedUpdate({ 
      config: {
        ...widget!.config,
        filters: {
          ...widget!.config.filters,
          selectedTestimonialIds: newIds,
          testimonialOrder: allSelected ? testimonialOrder : [...testimonialOrder, ...newIds.filter(id => !testimonialOrder.includes(id))]
        }
      }
    })
  }

  const copyEmbedCode = () => {
    const embedCode = `<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${window.location.origin}/widget/${widgetId}" async></script>`
    
    navigator.clipboard.writeText(embedCode)
    setEmbedCodeCopied(true)
    toast.success('Embed code copied to clipboard')
    
    setTimeout(() => setEmbedCodeCopied(false), 2000)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be less than 4MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/avatar',
      })

      // Update widget config with uploaded avatar URL
      handleConfigUpdate(['styling', 'fallbackAvatar'], {
        ...widget!.config.styling.fallbackAvatar,
        type: 'placeholder',
        placeholderUrl: blob.url
      }, true)

      toast.success('Avatar uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (!widget) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
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
              <h1 className="text-xl font-semibold">{widget.name}</h1>
              <p className="text-sm text-gray-500">Customize your widget appearance and behavior</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPreviewDevice('desktop')}>
              <Monitor className={`w-4 h-4 ${previewDevice === 'desktop' ? 'text-primary' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPreviewDevice('mobile')}>
              <Smartphone className={`w-4 h-4 ${previewDevice === 'mobile' ? 'text-primary' : ''}`} />
            </Button>
            <Button onClick={() => router.push('/dashboard/widgets')}>
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Settings Panel */}
        <div className="w-96 border-r bg-white dark:bg-gray-800 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="testimonials" className="flex-1">Testimonials</TabsTrigger>
              <TabsTrigger value="display" className="flex-1">Display</TabsTrigger>
              <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
              <TabsTrigger value="styling" className="flex-1">Styling</TabsTrigger>
              <TabsTrigger value="embed" className="flex-1">Embed</TabsTrigger>
            </TabsList>

            <TabsContent value="testimonials" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Testimonials</CardTitle>
                  <CardDescription>Choose which testimonials to display and set their order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <Label>
                        {selectedTestimonialIds.length} of {allTestimonials?.length || 0} selected
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAll}
                      >
                        {selectedTestimonialIds.length === allTestimonials?.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    
                    {allTestimonials && allTestimonials.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={testimonialOrder}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {testimonialOrder
                              .map(id => allTestimonials.find(t => t.id === id))
                              .filter(Boolean)
                              .map((testimonial) => (
                                <SortableTestimonialItem
                                  key={testimonial!.id}
                                  testimonial={testimonial}
                                  isSelected={selectedTestimonialIds.includes(testimonial!.id)}
                                  onToggle={() => toggleTestimonial(testimonial!.id)}
                                />
                              ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No testimonials available. Add testimonials to your forms first.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="display" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Display</CardTitle>
                  <CardDescription>Choose what information to show</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-rating">Show Rating Stars</Label>
                    <Switch
                      id="show-rating"
                      checked={widget.config.display.showRating}
                      onCheckedChange={(checked) => handleConfigUpdate(['display', 'showRating'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-photo">Show Customer Photo</Label>
                    <Switch
                      id="show-photo"
                      checked={widget.config.display.showPhoto}
                      onCheckedChange={(checked) => handleConfigUpdate(['display', 'showPhoto'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-company">Show Company Name</Label>
                    <Switch
                      id="show-company"
                      checked={widget.config.display.showCompany}
                      onCheckedChange={(checked) => handleConfigUpdate(['display', 'showCompany'], checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-date">Show Submission Date</Label>
                    <Switch
                      id="show-date"
                      checked={widget.config.display.showDate}
                      onCheckedChange={(checked) => handleConfigUpdate(['display', 'showDate'], checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Text Settings</CardTitle>
                  <CardDescription>Configure text display options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="truncate-length">Truncate Length</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="truncate-length"
                        type="number"
                        value={truncateLength}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                          if (!isNaN(value)) {
                            setTruncateLength(value)
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 200
                          setTruncateLength(value)
                          handleConfigUpdate(['display', 'truncateLength'], value, true)
                        }}
                        min="50"
                        max="500"
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">characters</span>
                    </div>
                    <p className="text-xs text-gray-500">Number of characters before truncation</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-read-more">Show Read More Button</Label>
                    <Switch
                      id="show-read-more"
                      checked={widget.config.display.showReadMore ?? true}
                      onCheckedChange={(checked) => handleConfigUpdate(['display', 'showReadMore'], checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {widget.type !== 'single' && widget.type !== 'badge' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label>Items Per Page</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Slider
                          value={[widget.config.display.itemsPerPage || 9]}
                          onValueChange={([value]) => handleConfigUpdate(['display', 'itemsPerPage'], value)}
                          min={1}
                          max={20}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">
                          {widget.config.display.itemsPerPage || 9}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="filters" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Filters</CardTitle>
                  <CardDescription>Control which testimonials appear</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="only-featured">Only Featured</Label>
                    <Switch
                      id="only-featured"
                      checked={widget.config.filters.onlyFeatured}
                      onCheckedChange={(checked) => handleConfigUpdate(['filters', 'onlyFeatured'], checked)}
                    />
                  </div>
                  <div>
                    <Label>Minimum Rating</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Slider
                        value={[widget.config.filters.minRating || 1]}
                        onValueChange={([value]) => handleConfigUpdate(['filters', 'minRating'], value)}
                        min={1}
                        max={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">
                        {widget.config.filters.minRating || 1}★
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Maximum Items</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Slider
                        value={[widget.config.filters.maxItems || 20]}
                        onValueChange={([value]) => handleConfigUpdate(['filters', 'maxItems'], value)}
                        min={1}
                        max={50}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">
                        {widget.config.filters.maxItems || 20}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form Selection</CardTitle>
                  <CardDescription>Choose which forms to include</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {forms?.map((form) => (
                      <div key={form.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`form-${form.id}`}
                          checked={widget.config.filters.formIds?.includes(form.id) || false}
                          onCheckedChange={(checked) => {
                            const formIds = widget.config.filters.formIds || []
                            if (checked) {
                              handleConfigUpdate(['filters', 'formIds'], [...formIds, form.id])
                            } else {
                              handleConfigUpdate(['filters', 'formIds'], formIds.filter(id => id !== form.id))
                            }
                          }}
                        />
                        <Label htmlFor={`form-${form.id}`} className="font-normal cursor-pointer">
                          {form.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="styling" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme Mode</Label>
                    <Select
                      value={widget.config.styling.theme}
                      onValueChange={(value: any) => handleConfigUpdate(['styling', 'theme'], value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {widget.config.styling.theme === 'custom' && (
                    <>
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={widget.config.styling.primaryColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'primaryColor'], e.target.value)}
                            className="w-20"
                          />
                          <Input
                            value={widget.config.styling.primaryColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'primaryColor'], e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={widget.config.styling.backgroundColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'backgroundColor'], e.target.value)}
                            className="w-20"
                          />
                          <Input
                            value={widget.config.styling.backgroundColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'backgroundColor'], e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={widget.config.styling.textColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'textColor'], e.target.value)}
                            className="w-20"
                          />
                          <Input
                            value={widget.config.styling.textColor}
                            onChange={(e) => handleConfigUpdate(['styling', 'textColor'], e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Density</Label>
                    <Select
                      value={widget.config.styling.layout}
                      onValueChange={(value: any) => handleConfigUpdate(['styling', 'layout'], value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Shadow</Label>
                    <Select
                      value={widget.config.styling.shadow}
                      onValueChange={(value: any) => handleConfigUpdate(['styling', 'shadow'], value)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Border Radius</Label>
                    <Input
                      value={widget.config.styling.borderRadius}
                      onChange={(e) => handleConfigUpdate(['styling', 'borderRadius'], e.target.value)}
                      placeholder="e.g., 0.5rem, 8px"
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fallback Avatar</CardTitle>
                  <CardDescription>Display options when customer photo is not available</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Avatar Type</Label>
                    <Select
                      value={widget.config.styling.fallbackAvatar?.type || 'initials'}
                      onValueChange={(value: 'initials' | 'placeholder') => 
                        handleConfigUpdate(['styling', 'fallbackAvatar'], {
                          ...widget.config.styling.fallbackAvatar,
                          type: value
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initials">Customer Initials</SelectItem>
                        <SelectItem value="placeholder">Placeholder Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {widget.config.styling.fallbackAvatar?.type === 'initials' && (
                    <>
                      <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={widget.config.styling.fallbackAvatar?.backgroundColor || '#3b82f6'}
                            onChange={(e) => 
                              handleConfigUpdate(['styling', 'fallbackAvatar'], {
                                ...widget.config.styling.fallbackAvatar,
                                backgroundColor: e.target.value
                              })
                            }
                            className="w-20"
                          />
                          <Input
                            value={widget.config.styling.fallbackAvatar?.backgroundColor || '#3b82f6'}
                            onChange={(e) => 
                              handleConfigUpdate(['styling', 'fallbackAvatar'], {
                                ...widget.config.styling.fallbackAvatar,
                                backgroundColor: e.target.value
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={widget.config.styling.fallbackAvatar?.textColor || '#FFFFFF'}
                            onChange={(e) => 
                              handleConfigUpdate(['styling', 'fallbackAvatar'], {
                                ...widget.config.styling.fallbackAvatar,
                                textColor: e.target.value
                              })
                            }
                            className="w-20"
                          />
                          <Input
                            value={widget.config.styling.fallbackAvatar?.textColor || '#FFFFFF'}
                            onChange={(e) => 
                              handleConfigUpdate(['styling', 'fallbackAvatar'], {
                                ...widget.config.styling.fallbackAvatar,
                                textColor: e.target.value
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {widget.config.styling.fallbackAvatar?.type === 'placeholder' && (
                    <div className="space-y-3">
                      <div>
                        <Label>Upload Placeholder Image</Label>
                        <div className="mt-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                            className="w-full"
                          >
                            {isUploadingAvatar ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {widget.config.styling.fallbackAvatar?.placeholderUrl && (
                        <div className="space-y-2">
                          <Label>Current Placeholder</Label>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <img
                              src={widget.config.styling.fallbackAvatar.placeholderUrl}
                              alt="Placeholder avatar"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-600 truncate">
                                {widget.config.styling.fallbackAvatar.placeholderUrl.split('/').pop()}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => 
                                handleConfigUpdate(['styling', 'fallbackAvatar'], {
                                  ...widget.config.styling.fallbackAvatar,
                                  placeholderUrl: ''
                                }, true)
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label>Or Use Image URL</Label>
                        <Input
                          value={widget.config.styling.fallbackAvatar?.placeholderUrl || ''}
                          onChange={(e) => 
                            handleConfigUpdate(['styling', 'fallbackAvatar'], {
                              ...widget.config.styling.fallbackAvatar,
                              placeholderUrl: e.target.value
                            })
                          }
                          placeholder="https://example.com/placeholder.png"
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Provide a URL to a placeholder image
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="embed" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy this code to add the widget to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
{`<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${window.location.origin}/widget/${widgetId}" async></script>`}
                    </pre>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={copyEmbedCode}
                    variant={embedCodeCopied ? 'default' : 'outline'}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    {embedCodeCopied ? 'Copied!' : 'Copy Embed Code'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Domain Whitelist</CardTitle>
                  <CardDescription>
                    Control which domains can display this widget (one per line)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="example.com
www.example.com
subdomain.example.com"
                    value={widget.allowedDomains?.join('\n') || ''}
                    onChange={(e) => handleDomainsUpdate(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to allow all domains
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-8">
          <div className="mx-auto transition-all duration-300" style={{
            maxWidth: previewDevice === 'mobile' ? '375px' : '100%',
          }}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  {selectedTestimonialIds.length > 0 
                    ? `${selectedTestimonialIds.length} selected`
                    : `${allTestimonials?.length || 0} testimonials`}
                </div>
              </div>
              <WidgetPreview 
                widget={{
                  ...widget,
                  config: {
                    ...widget.config,
                    display: {
                      ...widget.config.display,
                      truncateLength: truncateLength,
                    },
                    filters: {
                      ...widget.config.filters,
                      selectedTestimonialIds: selectedTestimonialIds,
                      testimonialOrder: testimonialOrder
                    }
                  }
                }} 
                testimonials={(() => {
                  if (!allTestimonials) return []
                  
                  // Filter testimonials based on current UI selection
                  let filtered = allTestimonials
                  if (selectedTestimonialIds.length > 0) {
                    filtered = allTestimonials.filter(t => selectedTestimonialIds.includes(t.id))
                  }
                  
                  // Apply custom order
                  if (testimonialOrder.length > 0) {
                    const orderMap = new Map(
                      testimonialOrder.map((id, index) => [id, index])
                    )
                    filtered = filtered.sort((a, b) => {
                      const orderA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER
                      const orderB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER
                      return orderA - orderB
                    })
                  }
                  
                  return filtered
                })()} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}