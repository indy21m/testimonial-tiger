-- Migration: Update form config schema
-- Date: 2025-01-16
-- Description: Updates form config to match new component requirements

-- Since this changes the JSONB structure, we need to update existing data
-- This migration assumes no production data exists yet

-- Update any existing forms to use the new schema structure
UPDATE forms 
SET config = jsonb_build_object(
  'title', config->'title',
  'description', config->'description',
  'questions', COALESCE(config->'questions', '[]'::jsonb),
  'settings', jsonb_build_object(
    'requireEmail', COALESCE((config->'settings'->>'collectEmail')::boolean, true),
    'requireName', COALESCE((config->'settings'->>'collectName')::boolean, true),
    'allowImage', COALESCE((config->'settings'->>'collectPhoto')::boolean, true),
    'allowVideo', COALESCE((config->'settings'->>'collectVideo')::boolean, false),
    'maxVideoLength', 60,
    'autoApprove', COALESCE((config->'settings'->>'autoApprove')::boolean, false),
    'sendEmailNotification', true,
    'redirectUrl', config->'settings'->>'redirectUrl',
    'successMessage', COALESCE(config->'settings'->>'successMessage', 'Thank you for your feedback!')
  ),
  'styling', jsonb_build_object(
    'theme', 'modern',
    'primaryColor', COALESCE(config->'styling'->>'primaryColor', '#3b82f6'),
    'backgroundColor', COALESCE(config->'styling'->>'backgroundColor', '#FFFFFF'),
    'fontFamily', COALESCE(config->'styling'->>'fontFamily', 'Inter, sans-serif'),
    'borderRadius', 'medium',
    'showLogo', false
  )
)
WHERE config IS NOT NULL;