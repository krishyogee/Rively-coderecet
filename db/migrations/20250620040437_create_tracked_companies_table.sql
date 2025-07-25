-- migrate:up
-- ------------------------------------------------
-- Create 'tracked_companies' table to store companies monitored by customers
-- ------------------------------------------------
CREATE TABLE tracked_companies (
    id SERIAL PRIMARY KEY,                                               -- Auto-incremented internal ID
    tracked_company_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),-- UUID for public reference
    name VARCHAR(255) NOT NULL,                                          -- Company name
    domain VARCHAR(256) NOT NULL,                                        -- Company domain
    type VARCHAR(255) NOT NULL,                                          -- Type of company (e.g., SaaS, D2C, etc.)
    interests VARCHAR(255)[] NOT NULL,                                   -- Array of interests/topics
    customer_uid UUID NOT NULL,                                          -- Reference to customer tracking the company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                      -- Timestamp of creation
    linkedin_username VARCHAR(255),                                      -- LinkedIn handle/username (optional)
    changelogs_url VARCHAR(255),                                         -- Changelogs URL (optional)
    CONSTRAINT fk_customer FOREIGN KEY (customer_uid) REFERENCES customers(customer_uid) -- FK constraint
);

-- migrate:down
-- ------------------------------------------------
-- Drop 'tracked_companies' table
-- ------------------------------------------------
DROP TABLE IF EXISTS tracked_companies;
