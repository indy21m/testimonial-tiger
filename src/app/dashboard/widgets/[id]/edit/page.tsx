'use client'

import { useState, useMemo, useCallback } from 'react'
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
import { ArrowLeft, Save, Monitor, Smartphone, Code, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { debounce } from 'lodash'
import { WidgetPreview } from '@/components/features/widget-preview'
import { Textarea } from '@/components/ui/textarea'

export default function WidgetEditorPage() {
  const params = useParams()
  const router = useRouter()
  const widgetId = params.id as string
  
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('display')
  const [embedCodeCopied, setEmbedCodeCopied] = useState(false)

  const { data: widget, refetch } = api.widget.get.useQuery({ id: widgetId })
  const { data: forms } = api.form.list.useQuery()
  const { data: testimonials } = api.widget.getTestimonials.useQuery({ widgetId })

  const updateMutation = api.widget.update.useMutation({
    onSuccess: () => {
      refetch()
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

  const handleConfigUpdate = useCallback((path: string[], value: any) => {
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

    debouncedUpdate({ config: newConfig })
  }, [widget, debouncedUpdate])

  const handleDomainsUpdate = useCallback((domains: string) => {
    const domainList = domains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0)
    
    debouncedUpdate({ allowedDomains: domainList })
  }, [debouncedUpdate])

  const copyEmbedCode = () => {
    const embedCode = `<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${window.location.origin}/widget/${widgetId}" async></script>`
    
    navigator.clipboard.writeText(embedCode)
    setEmbedCodeCopied(true)
    toast.success('Embed code copied to clipboard')
    
    setTimeout(() => setEmbedCodeCopied(false), 2000)
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
              <TabsTrigger value="display" className="flex-1">Display</TabsTrigger>
              <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
              <TabsTrigger value="styling" className="flex-1">Styling</TabsTrigger>
              <TabsTrigger value="embed" className="flex-1">Embed</TabsTrigger>
            </TabsList>

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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Maximum Text Length</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Slider
                        value={[widget.config.display.maxLength || 300]}
                        onValueChange={([value]) => handleConfigUpdate(['display', 'maxLength'], value)}
                        min={50}
                        max={500}
                        step={10}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">
                        {widget.config.display.maxLength || 300}
                      </span>
                    </div>
                  </div>
                  {widget.type !== 'single' && widget.type !== 'badge' && (
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
                  )}
                </CardContent>
              </Card>
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
                        <input
                          type="checkbox"
                          id={`form-${form.id}`}
                          checked={widget.config.filters.formIds?.includes(form.id) || false}
                          onChange={(e) => {
                            const formIds = widget.config.filters.formIds || []
                            if (e.target.checked) {
                              handleConfigUpdate(['filters', 'formIds'], [...formIds, form.id])
                            } else {
                              handleConfigUpdate(['filters', 'formIds'], formIds.filter(id => id !== form.id))
                            }
                          }}
                          className="rounded"
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
            </TabsContent>

            <TabsContent value="embed" className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Embed Code</CardTitle>
                  <CardDescription>Copy this code to add the widget to your website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                    <code className="text-sm whitespace-pre font-mono">
{`<!-- Testimonial Tiger Widget -->
<div id="tt-widget-${widgetId}"></div>
<script src="${window.location.origin}/widget/${widgetId}" async></script>`}
                    </code>
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
                  {testimonials?.length || 0} testimonials
                </div>
              </div>
              <WidgetPreview widget={widget} testimonials={testimonials || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}