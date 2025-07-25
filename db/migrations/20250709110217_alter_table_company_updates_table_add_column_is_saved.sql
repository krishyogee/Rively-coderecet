-- migrate:up
-- ------------------------------------------------
-- Add 'is_saved' column to 'company_updates' table
-- ------------------------------------------------
ALTER TABLE company_updates
ADD COLUMN is_saved NOT NULL BOOLEAN DEFAULT FALSE;

-- migrate:down
-- ------------------------------------------------
-- Remove 'is_saved' column from 'company_updates' table
-- ------------------------------------------------
ALTER TABLE company_updates
DROP COLUMN IF EXISTS is_saved;
