-- Add custom domain fields to forms table if they don't exist
-- This migration is safe to run multiple times

DO $$
BEGIN
    -- Check if custom_domain column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forms' 
        AND column_name = 'custom_domain'
    ) THEN
        ALTER TABLE forms ADD COLUMN custom_domain TEXT UNIQUE;
    END IF;
    
    -- Check if custom_domain_verified column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forms' 
        AND column_name = 'custom_domain_verified'
    ) THEN
        ALTER TABLE forms ADD COLUMN custom_domain_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;