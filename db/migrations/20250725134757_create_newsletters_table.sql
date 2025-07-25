-- migrate:up
-- ------------------------------------------------
-- Create 'newsletters' table to store uploaded newsletters
-- ------------------------------------------------
CREATE TABLE newsletters (
    id SERIAL PRIMARY KEY,                                               -- Auto-incremented internal ID
    newsletter_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),                 -- Public-facing UUID
    file_path TEXT NOT NULL,                                             -- Path to the uploaded file
    customer_uid UUID NOT NULL,                                          -- Associated customer
    department_uid UUID NOT NULL,                                        -- Associated department
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,             -- Creation timestamp
    CONSTRAINT fk_newsletter_customer FOREIGN KEY (customer_uid) REFERENCES customers(customer_uid),
    CONSTRAINT fk_newsletter_department FOREIGN KEY (department_uid) REFERENCES departments(department_uid)
);

-- migrate:down
-- ------------------------------------------------
-- Drop 'newsletters' table and dependencies
-- ------------------------------------------------
DROP TABLE IF EXISTS newsletters CASCADE;
