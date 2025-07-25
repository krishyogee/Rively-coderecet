-- migrate:up
-- ------------------------------------------------
-- Create 'customers' table to store customer details and subscription linkage
-- ------------------------------------------------
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,                                         -- Auto-incremented ID for Customer
    customer_uid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,  -- UUID for public reference
    email VARCHAR(255) NOT NULL UNIQUE,                            -- Customer email
    domain VARCHAR(255),                                           -- Customer's domain (optional)
    subscription_uid UUID,                                         -- Linked Subscription UID (foreign key reference)
    is_trial_expired BOOLEAN DEFAULT FALSE,                        -- Trial expiration status
    is_subscription_active BOOLEAN DEFAULT FALSE,                  -- Subscription active status
    is_verified BOOLEAN DEFAULT FALSE,                             -- Email/account verification status
    verification_token VARCHAR(255),                               -- Verification token
    verification_token_sent_at TIMESTAMPTZ,                        -- When verification token was last sent
    onboarding_completion BOOLEAN DEFAULT FALSE,                   -- Whether onboarding is completed
    created_at TIMESTAMPTZ DEFAULT NOW(),                          -- Timestamp when customer was created
    customer_context TEXT                                          -- Customer context (e.g., industry, mission, vision, etc.)
);

-- migrate:down
-- ------------------------------------------------
-- Drop 'customers' table
-- ------------------------------------------------
DROP TABLE IF EXISTS customers;

