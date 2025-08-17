-- Ensure user constraints exist (for fixing form creation)
-- This migration is safe to run multiple times

DO $$
BEGIN
    -- Check if the primary key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_pkey'
    ) THEN
        ALTER TABLE users ADD PRIMARY KEY (id);
    END IF;
    
    -- Check if the unique constraint on email exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE users ADD UNIQUE (email);
    END IF;
END $$;