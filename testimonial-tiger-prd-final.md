# **Testimonial Tiger - Technical Product Requirements Document**

**Version 2.1 - Production-Ready Feature Set**  
**Target Build Time: 4-6 weeks**  
**Status: Final - Ready for Implementation**

---

## **Executive Summary**

Testimonial Tiger is a streamlined testimonial collection and display platform designed to replace Senja with a more focused, customizable, and performant solution. Built with Next.js 15 and modern edge infrastructure, it provides essential features like form customization, widget styling, and Zapier integration while maintaining excellent performance and user experience.

**Core Philosophy**: Build what you'll actually use. Include customization where it matters, skip complexity where it doesn't. Ensure production-ready quality from day one.

---

## **Tech Stack (Per CLAUDE.md)**

```typescript
{
  framework: "Next.js 15+ (App Router)",
  language: "TypeScript (Strict Mode)",
  auth: "Clerk",
  database: "Neon Postgres",
  orm: "Drizzle ORM",
  api: "tRPC",
  styling: "Tailwind CSS 4.0 + shadcn/ui + Framer Motion",
  storage: "Vercel Blob",
  integrations: "Zapier (REST Hooks)",
  ai: "Google Gemini API (for smart suggestions only)",
  deployment: "Vercel",
  utilities: "lodash (for debouncing), date-fns"
}
```

---

## **Database Schema**

```typescript
// src/server/db/schema.ts
import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, pgEnum, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Enums
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected'])
export const widgetTypeEnum = pgEnum('widget_type', ['wall', 'carousel', 'grid', 'single', 'badge'])

// Users (from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  plan: text('plan').default('free'), // free, pro
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Forms with customization
export const forms = pgTable('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique().$defaultFn(() => createId()),
  
  // Content customization
  config: jsonb('config').$type<{
    title: string
    description: string
    questions: Array<{
      id: string
      type: 'text' | 'textarea' | 'rating' | 'select'
      label: string
      placeholder?: string
      required: boolean
      options?: string[]
    }>
    settings: {
      collectName: boolean
      collectEmail: boolean
      collectCompany: boolean
      collectPhoto: boolean
      collectVideo: boolean
      autoApprove: boolean
      redirectUrl?: string
      successMessage: string
    }
    styling: {
      theme: 'light' | 'dark' | 'auto'
      primaryColor: string
      backgroundColor: string
      fontFamily: string
      borderRadius: string
      customCSS?: string
    }
  }>().notNull().$default(() => ({
    title: 'We'd love your feedback!',
    description: 'Share your experience with our product',
    questions: [],
    settings: {
      collectName: true,
      collectEmail: true,
      collectCompany: true,
      collectPhoto: true,
      collectVideo: false,
      autoApprove: false,
      successMessage: 'Thank you for your feedback!'
    },
    styling: {
      theme: 'light',
      primaryColor: '#3b82f6',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter',
      borderRadius: '0.5rem'
    }
  })),
  
  // Analytics
  views: integer('views').default(0),
  submissions: integer('submissions').default(0),
  conversionRate: integer('conversion_rate').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIndex: index('form_user_idx').on(table.userId),
  slugIndex: index('form_slug_idx').on(table.slug),
}))

// Testimonials
export const testimonials = pgTable('testimonials', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  
  // Customer info
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerCompany: text('customer_company'),
  customerPhoto: text('customer_photo'),
  
  // Content
  content: text('content').notNull(),
  rating: integer('rating'),
  videoUrl: text('video_url'),
  videoThumbnail: text('video_thumbnail'),
  
  // Custom fields from form questions
  customFields: jsonb('custom_fields').$type<Record<string, any>>().default({}),
  
  // AI-generated summary (optional)
  aiSummary: text('ai_summary'),
  
  // Status
  status: statusEnum('status').default('pending'),
  featured: boolean('featured').default(false),
  
  // Metadata
  source: text('source').default('form'), // form, api, import
  metadata: jsonb('metadata').$type<{
    ip?: string
    userAgent?: string
    referrer?: string
  }>().default({}),
  
  submittedAt: timestamp('submitted_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
}, (table) => ({
  formIndex: index('testimonial_form_idx').on(table.formId),
  statusIndex: index('testimonial_status_idx').on(table.status),
  featuredIndex: index('testimonial_featured_idx').on(table.featured),
  // Add full-text search index in migration
}))

// Widgets with proper customization
export const widgets = pgTable('widgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: widgetTypeEnum('type').notNull(),
  
  // Configuration
  config: jsonb('config').$type<{
    display: {
      showRating: boolean
      showDate: boolean
      showPhoto: boolean
      showCompany: boolean
      maxLength?: number
      itemsPerPage?: number
    }
    filters: {
      formIds?: string[]
      onlyFeatured: boolean
      minRating?: number
      maxItems?: number
    }
    styling: {
      theme: 'light' | 'dark' | 'custom'
      layout: 'compact' | 'comfortable' | 'spacious'
      primaryColor: string
      backgroundColor: string
      textColor: string
      borderColor: string
      borderRadius: string
      shadow: 'none' | 'sm' | 'md' | 'lg'
      fontFamily: string
      customCSS?: string
    }
  }>().notNull().$default(() => ({
    display: {
      showRating: true,
      showDate: false,
      showPhoto: true,
      showCompany: true
    },
    filters: {
      onlyFeatured: false,
      maxItems: 20
    },
    styling: {
      theme: 'light',
      layout: 'comfortable',
      primaryColor: '#3b82f6',
      backgroundColor: '#FFFFFF',
      textColor: '#374151',
      borderColor: '#E5E7EB',
      borderRadius: '0.5rem',
      shadow: 'sm',
      fontFamily: 'Inter'
    }
  })),
  
  // Security
  allowedDomains: text('allowed_domains').array().default([]),
  
  // Analytics
  impressions: integer('impressions').default(0),
  interactions: integer('interactions').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIndex: index('widget_user_idx').on(table.userId),
}))

// Integrations
export const integrations = pgTable('integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // zapier, webhook
  name: text('name').notNull(),
  
  // Configuration
  config: jsonb('config').$type<{
    webhookUrl?: string
    apiKey?: string
    triggers: string[] // new_testimonial, approved, featured
    headers?: Record<string, string>
  }>().notNull(),
  
  isActive: boolean('is_active').default(true),
  lastTriggered: timestamp('last_triggered'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Webhook logs for debugging
export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  integrationId: uuid('integration_id').notNull().references(() => integrations.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  status: text('status').notNull(), // success, failed
  statusCode: integer('status_code'),
  response: text('response'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Migration for full-text search (save to /migrations/YYYY-MM-DD_add_fts.sql)
/*
ALTER TABLE "testimonials" ADD COLUMN "fts_document" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce("customerName", '') || ' ' || 
      coalesce("customerCompany", '') || ' ' || 
      coalesce("content", '')
    )
  ) STORED;
  
CREATE INDEX "fts_document_idx" ON "testimonials" USING GIN ("fts_document");
*/
```

---

## **Core Features**

### **1. Form Builder with Customization (Enhanced)**

```typescript
// src/app/dashboard/forms/[id]/edit/page.tsx
import { useState, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { motion } from 'framer-motion'

export default function FormEditor({ params }: { params: { id: string } }) {
  const { data: form } = api.form.get.useQuery({ id: params.id });
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Editor */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-6">
          {/* Save indicator */}
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-sm"
            >
              <span className="text-yellow-800 dark:text-yellow-200">
                Saving changes...
              </span>
            </motion.div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6 mt-6">
              <FormContentEditor form={form} />
            </TabsContent>
            
            <TabsContent value="style" className="space-y-6 mt-6">
              <FormStyleEditor form={form} />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 mt-6">
              <FormSettingsEditor form={form} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Panel - Live Preview */}
      <div className="w-1/2 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 dark:bg-gray-900 p-4 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Live Preview</span>
            <DevicePreviewToggle />
          </div>
        </div>
        
        <div className="p-8">
          <FormPreview form={form} />
        </div>
      </div>
    </div>
  );
}

// Form Content Editor with Debounced Saving
function FormContentEditor({ form }: { form: Form }) {
  const { mutate: updateForm } = api.form.update.useMutation();
  const [questions, setQuestions] = useState(form.config.questions);
  const [isSaving, setIsSaving] = useState(false);
  
  // Debounced update function - saves after 1 second of no changes
  const debouncedUpdate = useMemo(
    () => debounce((updates: any) => {
      setIsSaving(true);
      updateForm(
        { id: form.id, ...updates },
        {
          onSuccess: () => {
            setIsSaving(false);
            toast.success('Changes saved');
          },
          onError: (error) => {
            setIsSaving(false);
            toast.error('Failed to save changes');
            console.error(error);
          },
        }
      );
    }, 1000),
    [form.id, updateForm]
  );
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);
  
  const handleTitleChange = (title: string) => {
    debouncedUpdate({ 
      config: { ...form.config, title }
    });
  };
  
  const handleDescriptionChange = (description: string) => {
    debouncedUpdate({ 
      config: { ...form.config, description }
    });
  };
  
  const addQuestion = (type: string) => {
    const newQuestion = {
      id: createId(),
      type,
      label: `New ${type} question`,
      required: false,
    };
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    debouncedUpdate({
      config: { ...form.config, questions: updatedQuestions }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Form Title</Label>
            <Input
              value={form.config.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="We'd love your feedback!"
            />
          </div>
          
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.config.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Help us improve by sharing your experience"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Custom Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Questions</CardTitle>
          <CardDescription>
            Add additional questions beyond the default fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext>
            <SortableContext items={questions.map(q => q.id)}>
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    onUpdate={(updated) => {
                      const updatedQuestions = questions.map(q => 
                        q.id === question.id ? updated : q
                      );
                      setQuestions(updatedQuestions);
                      debouncedUpdate({
                        config: { ...form.config, questions: updatedQuestions }
                      });
                    }}
                    onDelete={() => {
                      const updatedQuestions = questions.filter(q => q.id !== question.id);
                      setQuestions(updatedQuestions);
                      debouncedUpdate({
                        config: { ...form.config, questions: updatedQuestions }
                      });
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => addQuestion('text')}>
              <Plus className="w-4 h-4 mr-1" /> Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => addQuestion('textarea')}>
              <Plus className="w-4 h-4 mr-1" /> Long Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => addQuestion('select')}>
              <Plus className="w-4 h-4 mr-1" /> Dropdown
            </Button>
          </div>
          
          {isSaving && (
            <p className="text-sm text-gray-500 mt-2">Saving...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### **2. Enhanced Dashboard with Performance Optimizations**

```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const { userId } = auth();
  
  // Parallel data fetching for better performance
  const [testimonials, forms, stats] = await Promise.all([
    getRecentTestimonials(userId, 10),
    getUserForms(userId),
    getDashboardStats(userId),
  ]);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your testimonial overview.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/forms/new">
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards with animated counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Testimonials"
          value={stats.total}
          change={stats.totalChange}
          icon={<MessageSquare />}
          animated
        />
        
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          change={stats.pendingChange}
          icon={<Clock />}
          action={
            <Link href="/dashboard/testimonials?status=pending">
              <Button size="sm" variant="ghost">Review →</Button>
            </Link>
          }
        />
        
        <StatsCard
          title="Average Rating"
          value={`${stats.avgRating.toFixed(1)} ★`}
          subtitle={`from ${stats.ratedCount} reviews`}
          icon={<Star />}
        />
        
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change={stats.conversionChange}
          icon={<TrendingUp />}
          animated
        />
      </div>
      
      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Testimonials */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Testimonials</CardTitle>
            <CardDescription>
              Latest submissions across all your forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onApprove={() => approveTestimonial(testimonial.id)}
                  onReject={() => rejectTestimonial(testimonial.id)}
                />
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/testimonials">View All Testimonials</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Form Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Form Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{form.name}</p>
                      <p className="text-sm text-gray-600">
                        {form.submissions} submissions
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {form.views > 0 
                        ? `${((form.submissions / form.views) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/widgets">
                  <Layout className="w-4 h-4 mr-2" />
                  Manage Widgets
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/integrations">
                  <Zap className="w-4 h-4 mr-2" />
                  Configure Integrations
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/import">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Testimonials
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialsChart data={stats.chartData} />
        </CardContent>
      </Card>
    </div>
  );
}

// Testimonial management page with full-text search
// src/app/dashboard/testimonials/page.tsx
export default function TestimonialsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    form: 'all',
    rating: 'all',
    search: '',
  });
  
  // Use full-text search when available
  const { data: testimonials } = api.testimonial.list.useQuery(filters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const handleBulkAction = async (action: string) => {
    if (action === 'approve') {
      await api.testimonial.bulkApprove.mutate({ ids: selectedIds });
    } else if (action === 'delete') {
      await api.testimonial.bulkDelete.mutate({ ids: selectedIds });
    }
    setSelectedIds([]);
  };
  
  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filters.status} onValueChange={(status) => setFilters({ ...filters, status })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.form} onValueChange={(form) => setFilters({ ...filters, form })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            {/* Dynamic form list */}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search testimonials..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-xs"
        />
        
        {selectedIds.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <Button onClick={() => handleBulkAction('approve')}>
              Approve Selected ({selectedIds.length})
            </Button>
            <Button variant="destructive" onClick={() => handleBulkAction('delete')}>
              Delete Selected
            </Button>
          </div>
        )}
      </div>
      
      {/* Testimonials Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === testimonials?.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds(testimonials?.map(t => t.id) || []);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials?.map((testimonial) => (
              <TestimonialRow 
                key={testimonial.id} 
                testimonial={testimonial}
                selected={selectedIds.includes(testimonial.id)}
                onSelect={(checked) => {
                  if (checked) {
                    setSelectedIds([...selectedIds, testimonial.id]);
                  } else {
                    setSelectedIds(selectedIds.filter(id => id !== testimonial.id));
                  }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

### **3. Widget Customization with Live Preview**

```typescript
// src/app/dashboard/widgets/[id]/edit/page.tsx
export default function WidgetEditor({ params }: { params: { id: string } }) {
  const { data: widget } = api.widget.get.useQuery({ id: params.id });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const { mutate: updateWidget } = api.widget.update.useMutation();
  
  // Debounced update for smooth editing experience
  const debouncedUpdate = useMemo(
    () => debounce((updates: any) => {
      updateWidget({ id: params.id, ...updates });
    }, 500),
    [params.id]
  );
  
  return (
    <div className="flex h-screen">
      {/* Settings Panel */}
      <div className="w-96 border-r overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Widget Settings</h2>
          
          {/* Display Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Rating</Label>
                <Switch
                  checked={widget.config.display.showRating}
                  onCheckedChange={(checked) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        display: { ...widget.config.display, showRating: checked }
                      }
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Show Customer Photo</Label>
                <Switch
                  checked={widget.config.display.showPhoto}
                  onCheckedChange={(checked) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        display: { ...widget.config.display, showPhoto: checked }
                      }
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Show Company</Label>
                <Switch
                  checked={widget.config.display.showCompany}
                  onCheckedChange={(checked) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        display: { ...widget.config.display, showCompany: checked }
                      }
                    })
                  }
                />
              </div>
              
              <div>
                <Label>Max Text Length</Label>
                <Input
                  type="number"
                  value={widget.config.display.maxLength}
                  onChange={(e) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        display: { ...widget.config.display, maxLength: parseInt(e.target.value) }
                      }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Style Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <RadioGroup
                  value={widget.config.styling.theme}
                  onValueChange={(theme) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        styling: { ...widget.config.styling, theme }
                      }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {widget.config.styling.theme === 'custom' && (
                <>
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={widget.config.styling.primaryColor}
                        onChange={(e) => 
                          debouncedUpdate({ 
                            config: { 
                              ...widget.config, 
                              styling: { ...widget.config.styling, primaryColor: e.target.value }
                            }
                          })
                        }
                        className="w-16"
                      />
                      <Input
                        value={widget.config.styling.primaryColor}
                        onChange={(e) => 
                          debouncedUpdate({ 
                            config: { 
                              ...widget.config, 
                              styling: { ...widget.config.styling, primaryColor: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={widget.config.styling.backgroundColor}
                        onChange={(e) => 
                          debouncedUpdate({ 
                            config: { 
                              ...widget.config, 
                              styling: { ...widget.config.styling, backgroundColor: e.target.value }
                            }
                          })
                        }
                        className="w-16"
                      />
                      <Input
                        value={widget.config.styling.backgroundColor}
                        onChange={(e) => 
                          debouncedUpdate({ 
                            config: { 
                              ...widget.config, 
                              styling: { ...widget.config.styling, backgroundColor: e.target.value }
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label>Layout Density</Label>
                <Select
                  value={widget.config.styling.layout}
                  onValueChange={(layout) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        styling: { ...widget.config.styling, layout }
                      }
                    })
                  }
                >
                  <SelectTrigger>
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
                  onValueChange={(shadow) => 
                    debouncedUpdate({ 
                      config: { 
                        ...widget.config, 
                        styling: { ...widget.config.styling, shadow }
                      }
                    })
                  }
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>
          
          {/* Domain Whitelist */}
          <Card>
            <CardHeader>
              <CardTitle>Allowed Domains</CardTitle>
              <CardDescription>
                Leave empty to allow all domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DomainWhitelist
                domains={widget.allowedDomains}
                onChange={(domains) => updateWidget({ 
                  id: params.id, 
                  allowedDomains: domains 
                })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Preview Panel */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Code className="w-4 h-4 mr-2" />
                    Get Embed Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Embed Code</DialogTitle>
                    <DialogDescription>
                      Copy and paste this code into your website
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <code className="text-sm">
                      {`<script src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js" data-widget-id="${widget.id}"></script>`}
                    </code>
                  </div>
                  
                  <Button onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    toast.success('Code copied to clipboard');
                  }}>
                    Copy Code
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className={cn(
            "mx-auto transition-all",
            previewDevice === 'mobile' ? "max-w-sm" : "max-w-4xl"
          )}>
            <WidgetPreview widget={widget} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **4. Zapier Integration with Parallel Processing**

```typescript
// src/server/services/webhook.ts
export class WebhookService {
  async triggerWebhooks(event: string, data: any, userId: string) {
    const integrations = await db.query.integrations.findMany({
      where: and(
        eq(integrations.userId, userId),
        eq(integrations.isActive, true),
        sql`${integrations.config}->>'triggers' @> ${JSON.stringify([event])}`
      ),
    });
    
    // Process all webhooks in parallel for better performance
    const results = await Promise.allSettled(
      integrations.map(integration => this.sendWebhook(integration, event, data))
    );
    
    // Log failures for debugging without blocking
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Webhook failed for integration ${integrations[index].id}:`, result.reason);
      }
    });
  }
  
  private async sendWebhook(integration: Integration, event: string, data: any) {
    try {
      const response = await fetch(integration.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...integration.config.headers,
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      // Log the result
      await db.insert(webhookLogs).values({
        integrationId: integration.id,
        event,
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        response: await response.text(),
      });
      
      // Update last triggered
      await db.update(integrations)
        .set({ lastTriggered: new Date() })
        .where(eq(integrations.id, integration.id));
        
    } catch (error) {
      // Log failure
      await db.insert(webhookLogs).values({
        integrationId: integration.id,
        event,
        status: 'failed',
        response: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Testimonial submission with background processing
async function handleTestimonialSubmission(data: TestimonialData) {
  const testimonial = await db.insert(testimonials).values(data).returning();
  const newTestimonial = testimonial[0];
  
  // Process AI and webhooks in background - don't await
  processTestimonialAsync(newTestimonial, data.userId);
  
  // Return immediately for instant user feedback
  return newTestimonial;
}

async function processTestimonialAsync(testimonial: Testimonial, userId: string) {
  // Run AI summary and webhooks in parallel
  await Promise.allSettled([
    // AI Summary (if content is long enough)
    (async () => {
      if (testimonial.content.length > 500) {
        try {
          const summary = await aiService.generateSummary(testimonial.content);
          await db.update(testimonials)
            .set({ aiSummary: summary })
            .where(eq(testimonials.id, testimonial.id));
        } catch (error) {
          console.error('AI summary failed:', error);
          // Fail silently - not critical
        }
      }
    })(),
    
    // Trigger webhooks
    webhookService.triggerWebhooks('new_testimonial', testimonial, userId)
  ]);
}
```

### **5. Widget Rendering with Scoped JavaScript**

```typescript
// src/app/api/widget/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const widget = await db.query.widgets.findFirst({
    where: eq(widgets.id, params.id),
  });
  
  if (!widget) {
    return new Response('Widget not found', { status: 404 });
  }
  
  // Check domain whitelist
  const referer = request.headers.get('referer');
  if (widget.allowedDomains?.length > 0 && referer) {
    const domain = new URL(referer).hostname;
    if (!widget.allowedDomains.includes(domain)) {
      return new Response('Domain not allowed', { status: 403 });
    }
  }
  
  // Get testimonials with filters applied
  const testimonials = await getWidgetTestimonials(widget);
  
  // Track impression (non-blocking)
  db.update(widgets)
    .set({ impressions: sql`${widgets.impressions} + 1` })
    .where(eq(widgets.id, widget.id))
    .then(() => {})
    .catch(console.error);
  
  // Render based on type
  const html = renderWidget(widget, testimonials);
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function renderWidget(widget: Widget, testimonials: Testimonial[]) {
  const { styling, display } = widget.config;
  
  // Generate CSS based on configuration
  const css = `
    <style>
      .tt-widget-${widget.id} {
        --primary: ${styling.primaryColor};
        --bg: ${styling.backgroundColor};
        --text: ${styling.textColor};
        --border: ${styling.borderColor};
        --radius: ${styling.borderRadius};
        --shadow: ${
          styling.shadow === 'none' ? 'none' :
          styling.shadow === 'sm' ? '0 1px 3px rgba(0,0,0,0.1)' :
          styling.shadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' :
          '0 10px 15px rgba(0,0,0,0.1)'
        };
        --spacing: ${
          styling.layout === 'compact' ? '0.75rem' :
          styling.layout === 'comfortable' ? '1rem' :
          '1.5rem'
        };
        
        font-family: ${styling.fontFamily}, sans-serif;
      }
      
      .tt-widget-${widget.id} .tt-testimonial {
        background: var(--bg);
        padding: var(--spacing);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        border: 1px solid var(--border);
        transition: transform 0.2s ease;
      }
      
      .tt-widget-${widget.id} .tt-testimonial:hover {
        transform: translateY(-2px);
      }
      
      ${styling.customCSS || ''}
    </style>
  `;
  
  // Render HTML based on widget type
  let html = '';
  
  switch (widget.type) {
    case 'wall':
      html = `
        <div class="tt-widget-${widget.id} tt-wall" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
          ${testimonials.map(t => renderTestimonialCard(t, display, widget.id)).join('')}
        </div>
      `;
      break;
      
    case 'carousel':
      html = `
        <div class="tt-widget-${widget.id} tt-carousel" data-autoplay="true" data-interval="5000">
          <div class="tt-carousel-inner">
            ${testimonials.map((t, i) => `
              <div class="tt-carousel-item ${i === 0 ? 'active' : ''}" style="display: ${i === 0 ? 'block' : 'none'};">
                ${renderTestimonialCard(t, display, widget.id)}
              </div>
            `).join('')}
          </div>
          <button class="tt-carousel-prev">‹</button>
          <button class="tt-carousel-next">›</button>
        </div>
        <script>
          // Scoped to prevent conflicts with multiple widgets
          (() => {
            const widget = document.currentScript.previousElementSibling;
            if (!widget) return;
            
            let currentSlide = 0;
            const slides = widget.querySelectorAll('.tt-carousel-item');
            const prevBtn = widget.querySelector('.tt-carousel-prev');
            const nextBtn = widget.querySelector('.tt-carousel-next');
            
            if (slides.length <= 1) {
              // Hide navigation if only one slide
              if (prevBtn) prevBtn.style.display = 'none';
              if (nextBtn) nextBtn.style.display = 'none';
              return;
            }
            
            function showSlide(index) {
              slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
              });
            }
            
            function next() {
              currentSlide = (currentSlide + 1) % slides.length;
              showSlide(currentSlide);
            }
            
            function prev() {
              currentSlide = (currentSlide - 1 + slides.length) % slides.length;
              showSlide(currentSlide);
            }
            
            if (nextBtn) nextBtn.addEventListener('click', next);
            if (prevBtn) prevBtn.addEventListener('click', prev);
            
            // Auto-play if enabled
            if (widget.dataset.autoplay === 'true') {
              const interval = parseInt(widget.dataset.interval) || 5000;
              setInterval(next, interval);
            }
          })();
        </script>
      `;
      break;
      
    case 'grid':
      html = `
        <div class="tt-widget-${widget.id} tt-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          ${testimonials.map(t => renderTestimonialCard(t, display, widget.id)).join('')}
        </div>
      `;
      break;
  }
  
  return css + html;
}

function renderTestimonialCard(testimonial: Testimonial, display: any, widgetId: string) {
  return `
    <div class="tt-testimonial">
      ${display.showRating && testimonial.rating ? `
        <div class="tt-rating" style="color: var(--primary); margin-bottom: 0.5rem;">
          ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
        </div>
      ` : ''}
      
      <p class="tt-content" style="color: var(--text); line-height: 1.6; margin-bottom: 1rem;">
        ${display.maxLength && testimonial.content.length > display.maxLength
          ? testimonial.content.substring(0, display.maxLength) + '...'
          : testimonial.content
        }
      </p>
      
      <div class="tt-author" style="display: flex; align-items: center; gap: 0.75rem;">
        ${display.showPhoto && testimonial.customerPhoto ? `
          <img src="${testimonial.customerPhoto}" alt="${testimonial.customerName}" 
               style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
        ` : ''}
        
        <div>
          <div style="font-weight: 600; color: var(--text);">
            ${testimonial.customerName}
          </div>
          ${display.showCompany && testimonial.customerCompany ? `
            <div style="font-size: 0.875rem; color: var(--text); opacity: 0.7;">
              ${testimonial.customerCompany}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
```

### **6. Optional: Smart AI Features (Gemini)**

```typescript
// src/server/services/ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  
  // Generate a concise summary of a long testimonial
  async generateSummary(content: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Summarize this testimonial in one compelling sentence that captures the key benefit: "${content}"`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  
  // Suggest form questions based on business type
  async suggestQuestions(businessType: string, currentQuestions: string[]): Promise<string[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Business type: ${businessType}
      Current questions: ${currentQuestions.join(', ')}
      
      Suggest 3 additional testimonial questions that would help showcase the value of this business.
      Return only the questions, one per line.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text().split('\n').filter(q => q.trim());
  }
}
```

---

## **Deployment Timeline**

### **Week 1-2: Foundation & Forms**
- [ ] Project setup with Next.js 15, Clerk, Neon
- [ ] Database schema and migrations
- [ ] Form builder with debounced saving
- [ ] Public form submission
- [ ] File uploads to Vercel Blob

### **Week 3-4: Dashboard & Management**
- [ ] Dashboard with stats and charts
- [ ] Testimonials management page with full-text search
- [ ] Bulk actions and filtering
- [ ] Form settings and styling

### **Week 5: Widgets & Display**
- [ ] Widget types (wall, carousel, grid)
- [ ] Widget customization editor with live preview
- [ ] Embed code generation with scoped JavaScript
- [ ] Domain whitelist security

### **Week 6: Integrations & Polish**
- [ ] Zapier webhook integration with parallel processing
- [ ] Custom webhook support
- [ ] Import from CSV
- [ ] Optional: Gemini AI summaries (background processing)
- [ ] Testing and bug fixes
- [ ] Performance optimization

---

## **Critical Implementation Notes**

### **Performance Optimizations**
✅ **Debounced form/widget editing** - Prevents excessive API calls  
✅ **Parallel webhook processing** - Uses Promise.allSettled for concurrent execution  
✅ **Background AI processing** - Non-blocking testimonial submissions  
✅ **Full-text search indexing** - For scalable testimonial search  
✅ **Optimistic UI updates** - Instant feedback with background saving  
✅ **Stale-while-revalidate caching** - For widget API responses

### **Security & Reliability**
✅ **Scoped widget JavaScript** - Prevents conflicts with multiple widgets  
✅ **Domain whitelist validation** - Controls where widgets can be embedded  
✅ **Webhook timeout handling** - 10-second timeout prevents hanging  
✅ **Error boundary implementation** - Graceful failure handling  
✅ **CSRF protection** - Built into tRPC  
✅ **Rate limiting** - On public endpoints

### **What This Includes**
✅ **Form customization** - Visual editor with debounced saving  
✅ **Robust dashboard** - Stats, charts, and activity feed  
✅ **Widget customization** - Multiple types with live preview  
✅ **Zapier integration** - Parallel webhook processing  
✅ **Bulk operations** - Efficient multi-select actions  
✅ **Domain security** - Whitelist for widget embedding  
✅ **Import/Export** - CSV import for existing testimonials  
✅ **Optional AI** - Background processing for summaries

### **What We're NOT Building**
❌ Video recording in browser (just file upload)  
❌ Multi-language support  
❌ Team workspaces  
❌ A/B testing  
❌ Complex funnel flows  
❌ White-label features  
❌ Mobile apps  
❌ Email notifications (use Zapier for this)

---

## **Success Metrics**

- Form submission response time < 200ms
- Widget load time < 500ms
- Dashboard load time < 1s
- Zero JavaScript conflicts with multiple widgets
- 99.9% webhook delivery success rate
- Full-text search response < 100ms for 100k testimonials

---

## **Post-Launch Roadmap**

**Month 2:**
- Email notification system
- Advanced analytics dashboard
- Widget A/B testing

**Month 3:**
- Team workspaces
- Video testimonial recording
- Advanced AI features

**Month 4:**
- White-label options
- API for developers
- Mobile app

---

This production-ready PRD incorporates all critical fixes while maintaining the practical 4-6 week timeline. The focus remains on building a solid, performant foundation that can scale and evolve based on user feedback.