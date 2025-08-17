-- Add custom domain fields to forms table
ALTER TABLE forms ADD COLUMN custom_domain TEXT UNIQUE;
ALTER TABLE forms ADD COLUMN custom_domain_verified BOOLEAN DEFAULT FALSE;