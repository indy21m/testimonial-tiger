-- Check if widgets table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'widgets') THEN
    -- Create widgets table only if it doesn't exist
    CREATE TABLE widgets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type widget_type NOT NULL,
      config JSONB NOT NULL DEFAULT '{
        "display": {
          "showRating": true,
          "showPhoto": true,
          "showCompany": true,
          "showDate": false,
          "maxLength": 300,
          "count": 9
        },
        "styling": {
          "theme": "minimal",
          "primaryColor": "#9333EA",
          "backgroundColor": "#FFFFFF",
          "fontFamily": "Inter",
          "borderRadius": "medium",
          "shadow": "medium",
          "layout": "comfortable"
        },
        "filters": {
          "formIds": [],
          "minRating": 4,
          "onlyFeatured": false,
          "excludeEmpty": {}
        }
      }'::jsonb,
      allowed_domains TEXT[] DEFAULT '{}',
      impressions INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_widgets_user_id ON widgets(user_id);
    CREATE INDEX idx_widgets_type ON widgets(type);
    CREATE INDEX idx_widgets_created_at ON widgets(created_at DESC);
  END IF;
END $$;

-- Add widget_views column to testimonials if it doesn't exist
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS widget_views INTEGER DEFAULT 0;