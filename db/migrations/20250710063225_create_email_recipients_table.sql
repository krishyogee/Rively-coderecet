-- migrate:up
-- ------------------------------------------------
-- Create 'email_recipients' table to store email recipients
-- ------------------------------------------------
CREATE TABLE email_recipients (
    id SERIAL PRIMARY KEY,                                               -- Auto-incremented internal ID
    email_recipient_uid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(), -- Public-facing UUID
    name VARCHAR(255) NOT NULL,                                          -- Recipient's name
    email VARCHAR(255) NOT NULL UNIQUE,                                  -- Recipient's email (should be normalized)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,                          -- Active status of the recipient
    department_uid UUID NOT NULL,                                        -- Associated department
    customer_uid UUID NOT NULL,                                          -- Associated customer
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,             -- Creation timestamp
    CONSTRAINT fk_customer FOREIGN KEY (customer_uid) REFERENCES customers(customer_uid),
    CONSTRAINT fk_department FOREIGN KEY (department_uid) REFERENCES departments(department_uid)
);


-- migrate:down
-- ------------------------------------------------
-- Drop 'email_recipients' table and dependencies
-- ------------------------------------------------
DROP TABLE IF EXISTS email_recipients CASCADE;