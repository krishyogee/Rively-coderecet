-- migrate:up
-- ------------------------------------------------
-- Create 'Departments' table to store default departments
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS Departments (
    id SERIAL PRIMARY KEY,                                         -- Auto-incremented internal ID
    department_uid UUID DEFAULT uuid_generate_v4() NOT NULL UNIQUE, -- UUID for public reference
    name VARCHAR(50) NOT NULL UNIQUE                              -- Department name (unique)
);

-- Insert default departments
INSERT INTO Departments (name)
VALUES 
    ('Leadership'),
    ('Product'),
    ('HR'),
    ('Finance'),
    ('Marketing & Sales')
ON CONFLICT (name) DO NOTHING;                                    -- Avoid duplicates on rerun

-- migrate:down
-- ------------------------------------------------
-- Drop 'Departments' table
-- ------------------------------------------------
DROP TABLE IF EXISTS Departments;
