-- Add new fields to widgets table for testimonial selection and customization
-- Note: The config column is JSONB, so we update it using jsonb_set

-- Update existing widgets to add new config fields with defaults
UPDATE widgets
SET config = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        config,
        '{display,truncateLength}',
        '200'::jsonb,
        true
      ),
      '{display,showReadMore}',
      'true'::jsonb,
      true
    ),
    '{filters,selectedTestimonialIds}',
    '[]'::jsonb,
    true
  ),
  '{filters,testimonialOrder}',
  '[]'::jsonb,
  true
)
WHERE config IS NOT NULL;

-- Add fallback avatar settings to styling
UPDATE widgets
SET config = jsonb_set(
  config,
  '{styling,fallbackAvatar}',
  '{"type": "initials", "backgroundColor": "#3b82f6", "textColor": "#FFFFFF"}'::jsonb,
  true
)
WHERE config IS NOT NULL;