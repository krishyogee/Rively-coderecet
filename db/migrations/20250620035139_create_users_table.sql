-- migrate:up
-- ------------------------------------------------
-- Create 'users' table and link with 'customers' using UUID
-- ------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                                          -- Auto-incremented ID for User
    user_id UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE,        -- UUID for public reference
    name VARCHAR(255),                                              -- Name of the user
    email VARCHAR(255) NOT NULL UNIQUE,                             -- User's email
    is_verified BOOLEAN DEFAULT FALSE,                              -- Verification status
    customer_uid UUID,                                              -- UUID reference to 'customers'
    created_at TIMESTAMPTZ DEFAULT NOW(),                           -- Creation timestamp
    role VARCHAR(50),                                               -- Role of the user
    clerk_id VARCHAR UNIQUE,                                        -- Clerk ID
    department_uid UUID REFERENCES Departments(department_uid),     -- FK to Departments
    CONSTRAINT fk_customer_uid FOREIGN KEY (customer_uid) REFERENCES customers(customer_uid)
);

-- migrate:down
-- ------------------------------------------------
-- Drop 'users' table
-- ------------------------------------------------
DROP TABLE IF EXISTS users;
