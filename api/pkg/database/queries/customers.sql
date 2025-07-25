-- name: CreateCustomer :one
INSERT INTO customers (customer_uid, domain, email, is_verified)
VALUES (uuid_generate_v4(), $1, $2, $3)
RETURNING id, customer_uid, domain, email, is_verified, created_at;

-- name: GetCustomerById :one
SELECT id, customer_uid, domain, email, is_verified, created_at, verification_token
FROM customers
WHERE id = $1;

-- name: GetCustomerByUID :one
SELECT 
    c.id,
    c.customer_uid,
    c.domain,
    c.email,
    c.is_verified,
    c.created_at,
    c.verification_token,
    c.owner_id,
    c.onboarding_completion,
    c.verification_token_sent_at,
    -- Owner details from users table
    u.id as id,
    u.clerk_id as clerk_id,
    u.user_id as user_id,
    u.email as user_email
FROM customers c
LEFT JOIN users u ON c.owner_id = u.id
WHERE c.customer_uid = $1;


-- name: ListCustomers :many
SELECT id, customer_uid, domain, email, is_verified, created_at
FROM customers
ORDER BY created_at DESC;

-- name: UpdateCustomer :exec
UPDATE customers
SET domain = $2, email = $3, is_verified = $4, verification_token_sent_at = $5
WHERE customer_uid = $1
RETURNING id, customer_uid, domain, email, is_verified, created_at, verification_token_sent_at ;

-- name: DeleteCustomer :exec
DELETE FROM customers
WHERE id = $1;

-- name: VerifyCustomer :exec
UPDATE customers
SET is_verified = TRUE
WHERE id = $1
RETURNING id, customer_uid, domain, email, is_verified, created_at;

-- name: CountCustomers :one
SELECT COUNT(*) AS total_customers
FROM customers;

-- name: UpdateCustomerOwnerID :one
UPDATE customers
SET owner_id = $2
WHERE id = $1
RETURNING id, customer_uid, owner_id, domain, email, is_verified, created_at;

-- name: UpdateCustomerVerificationToken :exec
UPDATE customers
set verification_token = $2
WHERE id = $1
RETURNING id, customer_uid, verification_token;

-- name: UpdateCustomerVerification :exec
UPDATE customers 
SET is_verified = $2
WHERE customer_uid = $1;

-- name: UpdateCustomerDomain :one
UPDATE customers
SET domain = $2
WHERE customer_uid = $1
RETURNING id, customer_uid, domain, email, is_verified, created_at;

-- name: GetCustomerEmailByUID :one
SELECT email
FROM customers
WHERE customer_uid = $1;