-- migrate:up
-- ------------------------------------------------
-- Create 'company_updates' table to store updates related to tracked companies
-- ------------------------------------------------
CREATE TABLE company_updates (
    id SERIAL PRIMARY KEY,                                                     -- Auto-incremented internal ID
    company_update_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),       -- UUID for public reference
    title VARCHAR(500) NOT NULL,                                               -- Title of the update (increased length)
    description TEXT NOT NULL,                                                 -- Description of the update (unlimited length)
    update_category VARCHAR(255) NOT NULL,                                     -- Category of the update (e.g., product, funding)
    update_type VARCHAR(255) NOT NULL,                                         -- Type of update (e.g., article, event)
    source_type VARCHAR(255) NOT NULL,                                         -- Source type (e.g., blog, news)
    source_url VARCHAR(500) NOT NULL,                                          -- Source URL (increased length)
    posted_at TIMESTAMP NOT NULL,                                              -- Timestamp when the update was originally posted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                            -- Timestamp when record was created
    action_point TEXT,                                                -- Summary or insight derived from the update
    tracked_company_uid UUID NOT NULL,                                         -- FK to tracked company
    CONSTRAINT fk_tracked_company FOREIGN KEY (tracked_company_uid) REFERENCES tracked_companies(tracked_company_uid)
);

-- migrate:down
-- ------------------------------------------------
-- Drop 'company_updates' table
-- ------------------------------------------------
DROP TABLE IF EXISTS company_updates;
