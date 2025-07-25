-- migrate:up
-- ------------------------------------------------
-- Add 'isactive' column to 'tracked_companies' table
-- ------------------------------------------------
ALTER TABLE tracked_companies
ADD COLUMN isactive BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN tracked_companies.isactive IS 'Flag indicating whether the company tracking is active';

-- migrate:down
-- ------------------------------------------------
-- Remove 'isactive' column from 'tracked_companies' table
-- ------------------------------------------------
ALTER TABLE tracked_companies
DROP COLUMN IF EXISTS isactive;