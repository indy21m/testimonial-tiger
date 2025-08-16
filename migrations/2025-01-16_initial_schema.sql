-- Initial schema for Testimonial Tiger
-- Generated: 2025-01-16

-- Create enums
CREATE TYPE "status" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "widget_type" AS ENUM ('wall', 'carousel', 'grid', 'single', 'badge');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "plan" text DEFAULT 'free',
  "stripe_customer_id" text,
  "created_at" timestamp DEFAULT now()
);

-- Create forms table
CREATE TABLE IF NOT EXISTS "forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "config" jsonb NOT NULL DEFAULT '{
    "title": "We''d love your feedback!",
    "description": "Share your experience with our product",
    "questions": [],
    "settings": {
      "collectName": true,
      "collectEmail": true,
      "collectCompany": true,
      "collectPhoto": true,
      "collectVideo": false,
      "autoApprove": false,
      "successMessage": "Thank you for your feedback!"
    },
    "styling": {
      "theme": "light",
      "primaryColor": "#3b82f6",
      "backgroundColor": "#FFFFFF",
      "fontFamily": "Inter",
      "borderRadius": "0.5rem"
    }
  }'::jsonb,
  "views" integer DEFAULT 0,
  "submissions" integer DEFAULT 0,
  "conversion_rate" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "form_id" uuid NOT NULL REFERENCES "forms"("id") ON DELETE CASCADE,
  "customer_name" text NOT NULL,
  "customer_email" text,
  "customer_company" text,
  "customer_photo" text,
  "content" text NOT NULL,
  "rating" integer,
  "video_url" text,
  "video_thumbnail" text,
  "custom_fields" jsonb DEFAULT '{}'::jsonb,
  "ai_summary" text,
  "status" "status" DEFAULT 'pending',
  "featured" boolean DEFAULT false,
  "source" text DEFAULT 'form',
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "submitted_at" timestamp DEFAULT now(),
  "approved_at" timestamp
);

-- Create widgets table  
CREATE TABLE IF NOT EXISTS "widgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "name" text NOT NULL,
  "type" "widget_type" NOT NULL,
  "config" jsonb NOT NULL DEFAULT '{
    "display": {
      "showRating": true,
      "showDate": false,
      "showPhoto": true,
      "showCompany": true
    },
    "filters": {
      "onlyFeatured": false,
      "maxItems": 20
    },
    "styling": {
      "theme": "light",
      "layout": "comfortable",
      "primaryColor": "#3b82f6",
      "backgroundColor": "#FFFFFF",
      "textColor": "#374151",
      "borderColor": "#E5E7EB",
      "borderRadius": "0.5rem",
      "shadow": "sm",
      "fontFamily": "Inter"
    }
  }'::jsonb,
  "allowed_domains" text[] DEFAULT ARRAY[]::text[],
  "impressions" integer DEFAULT 0,
  "interactions" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS "integrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "users"("id"),
  "type" text NOT NULL,
  "name" text NOT NULL,
  "config" jsonb NOT NULL,
  "is_active" boolean DEFAULT true,
  "last_triggered" timestamp,
  "created_at" timestamp DEFAULT now()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS "webhook_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "integration_id" uuid NOT NULL REFERENCES "integrations"("id") ON DELETE CASCADE,
  "event" text NOT NULL,
  "status" text NOT NULL,
  "status_code" integer,
  "response" text,
  "created_at" timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX "form_user_idx" ON "forms"("user_id");
CREATE INDEX "form_slug_idx" ON "forms"("slug");
CREATE INDEX "testimonial_form_idx" ON "testimonials"("form_id");
CREATE INDEX "testimonial_status_idx" ON "testimonials"("status");
CREATE INDEX "testimonial_featured_idx" ON "testimonials"("featured");
CREATE INDEX "widget_user_idx" ON "widgets"("user_id");

-- Add full-text search for testimonials
ALTER TABLE "testimonials" ADD COLUMN "fts_document" tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce("customer_name", '') || ' ' || 
      coalesce("customer_company", '') || ' ' || 
      coalesce("content", '')
    )
  ) STORED;
  
CREATE INDEX "fts_document_idx" ON "testimonials" USING GIN ("fts_document");

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON "forms"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widgets_updated_at BEFORE UPDATE ON "widgets"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();