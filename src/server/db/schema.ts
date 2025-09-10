import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'

// Enums
export const statusEnum = pgEnum('status', ['pending', 'approved', 'rejected'])
export const widgetTypeEnum = pgEnum('widget_type', [
  'wall',
  'carousel',
  'grid',
  'single',
  'badge',
])

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
export const forms = pgTable(
  'forms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug')
      .notNull()
      .unique()
      .$defaultFn(() => createId()),

    // Custom domain support
    customDomain: text('custom_domain').unique(),
    customDomainVerified: boolean('custom_domain_verified').default(false),

    // Content customization
    config: jsonb('config')
      .$type<{
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
          requireEmail: boolean
          requireName: boolean
          allowVideo: boolean
          allowImage: boolean
          maxVideoLength: number
          autoApprove: boolean
          sendEmailNotification: boolean
          redirectUrl?: string
          successMessage: string
        }
        prePrompt?: {
          enabled: boolean
          title: string
          questions: string[]
        }
        styling: {
          theme: 'minimal' | 'modern' | 'bold' | 'custom'
          primaryColor: string
          backgroundColor: string
          fontFamily: string
          borderRadius: 'none' | 'small' | 'medium' | 'large'
          showLogo: boolean
          logoUrl?: string
        }
      }>()
      .notNull()
      .$default(() => ({
        title: "We'd love your feedback!",
        description: 'Share your experience with our product',
        questions: [],
        settings: {
          requireName: true,
          requireEmail: true,
          allowImage: true,
          allowVideo: false,
          maxVideoLength: 60,
          autoApprove: false,
          sendEmailNotification: true,
          successMessage: 'Thank you for your feedback!',
        },
        styling: {
          theme: 'modern',
          primaryColor: '#3b82f6',
          backgroundColor: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 'medium',
          showLogo: false,
        },
      })),

    // Analytics
    views: integer('views').default(0),
    submissions: integer('submissions').default(0),
    conversionRate: integer('conversion_rate').default(0),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIndex: index('form_user_idx').on(table.userId),
    slugIndex: index('form_slug_idx').on(table.slug),
  })
)

// Testimonials
export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    formId: uuid('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),

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
    customFields: jsonb('custom_fields')
      .$type<Record<string, unknown>>()
      .default({}),

    // AI-generated summary (optional)
    aiSummary: text('ai_summary'),

    // Status
    status: statusEnum('status').default('pending'),
    featured: boolean('featured').default(false),

    // Metadata
    source: text('source').default('form'), // form, api, import
    metadata: jsonb('metadata')
      .$type<{
        ip?: string
        userAgent?: string
        referrer?: string
      }>()
      .default({}),

    submittedAt: timestamp('submitted_at').defaultNow(),
    approvedAt: timestamp('approved_at'),
  },
  (table) => ({
    formIndex: index('testimonial_form_idx').on(table.formId),
    statusIndex: index('testimonial_status_idx').on(table.status),
    featuredIndex: index('testimonial_featured_idx').on(table.featured),
    // Add full-text search index in migration
  })
)

// Widgets with proper customization
export const widgets = pgTable(
  'widgets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    type: widgetTypeEnum('type').notNull(),

    // Configuration
    config: jsonb('config')
      .$type<{
        display: {
          showRating: boolean
          showDate: boolean
          showPhoto: boolean
          showCompany: boolean
          maxLength?: number
          itemsPerPage?: number
          truncateLength?: number
          showReadMore?: boolean
        }
        filters: {
          formIds?: string[]
          onlyFeatured: boolean
          minRating?: number
          maxItems?: number
          selectedTestimonialIds?: string[]
          testimonialOrder?: string[]
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
          fallbackAvatar?: {
            type: 'initials' | 'placeholder'
            backgroundColor?: string
            textColor?: string
            placeholderUrl?: string
          }
        }
      }>()
      .notNull()
      .$default(() => ({
        display: {
          showRating: true,
          showDate: false,
          showPhoto: true,
          showCompany: true,
          truncateLength: 200,
          showReadMore: true,
        },
        filters: {
          onlyFeatured: false,
          maxItems: 20,
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
          fontFamily: 'Inter',
          fallbackAvatar: {
            type: 'initials',
            backgroundColor: '#3b82f6',
            textColor: '#FFFFFF',
          },
        },
      })),

    // Security
    allowedDomains: text('allowed_domains')
      .array()
      .default(sql`ARRAY[]::text[]`),

    // Analytics
    impressions: integer('impressions').default(0),
    interactions: integer('interactions').default(0),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIndex: index('widget_user_idx').on(table.userId),
  })
)

// Integrations
export const integrations = pgTable('integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(), // zapier, webhook
  name: text('name').notNull(),

  // Configuration
  config: jsonb('config')
    .$type<{
      webhookUrl?: string
      apiKey?: string
      triggers: string[] // new_testimonial, approved, featured
      headers?: Record<string, string>
    }>()
    .notNull(),

  isActive: boolean('is_active').default(true),
  lastTriggered: timestamp('last_triggered'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Webhook logs for debugging
export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  integrationId: uuid('integration_id')
    .notNull()
    .references(() => integrations.id, { onDelete: 'cascade' }),
  event: text('event').notNull(),
  status: text('status').notNull(), // success, failed
  statusCode: integer('status_code'),
  response: text('response'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
import { relations } from 'drizzle-orm'

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  testimonials: many(testimonials),
}))

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  form: one(forms, {
    fields: [testimonials.formId],
    references: [forms.id],
  }),
}))

export const widgetsRelations = relations(widgets, ({ one }) => ({
  user: one(users, {
    fields: [widgets.userId],
    references: [users.id],
  }),
}))

export const integrationsRelations = relations(
  integrations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [integrations.userId],
      references: [users.id],
    }),
    logs: many(webhookLogs),
  })
)

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  integration: one(integrations, {
    fields: [webhookLogs.integrationId],
    references: [integrations.id],
  }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert
export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
export type Widget = typeof widgets.$inferSelect
export type NewWidget = typeof widgets.$inferInsert
export type Integration = typeof integrations.$inferSelect
export type NewIntegration = typeof integrations.$inferInsert
