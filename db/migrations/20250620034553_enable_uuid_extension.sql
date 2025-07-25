-- migrate:up
-- ------------------------------------------------
-- Enable 'uuid-ossp' extension to support UUID generation
-- ------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- migrate:down
-- ------------------------------------------------
-- Remove the extension (only if not used elsewhere)
-- ------------------------------------------------
DROP EXTENSION IF EXISTS "uuid-ossp";
