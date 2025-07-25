-- migrate:up
-- ------------------------------------------------
-- Alter 'customers' table to add 'owner_id' referencing 'users'
-- ------------------------------------------------
ALTER TABLE customers
ADD COLUMN owner_id INT,                                                    -- ID of the user who owns the customer
ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id)         -- FK to 'users' table
ON DELETE SET NULL;                                                         -- Nullify owner if user is deleted

-- migrate:down
-- ------------------------------------------------
-- Remove 'owner_id' column and foreign key from 'customers' table
-- ------------------------------------------------
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS fk_owner,
DROP COLUMN IF EXISTS owner_id;
