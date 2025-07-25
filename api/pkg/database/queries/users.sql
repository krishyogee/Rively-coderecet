-- name: CreateUser :one
INSERT INTO users (user_id, email, is_verified, customer_uid, clerk_id)
VALUES (uuid_generate_v4(), $1, $2, $3, $4)
RETURNING id, user_id, clerk_id, email, is_verified, customer_uid, created_at;

-- name: GetUserById :one
SELECT id, user_id, name, email, is_verified, customer_uid, created_at, clerk_id
FROM users
WHERE id = $1;

-- name: GetUserByUUID :one
SELECT id, user_id, name, email, is_verified, customer_uid, created_at
FROM users
WHERE user_id = $1;

-- name: ListUsers :many
SELECT id, user_id, name, email, is_verified, customer_uid, created_at
FROM users
ORDER BY created_at DESC;

-- name: ListUsersByCustomerUID :many
SELECT id, user_id, name, email, is_verified
FROM users
WHERE customer_uid = $1
ORDER BY created_at DESC;

-- name: UpdateUser :exec
UPDATE users
SET name = $2, email = $3, is_verified = $4
WHERE id = $1
RETURNING id, user_id, name, email, is_verified, customer_uid, created_at;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: VerifyUser :exec
UPDATE users
SET is_verified = TRUE
WHERE id = $1
RETURNING id, user_id, name, email, is_verified, customer_uid, created_at;

-- name: CountUsers :one
SELECT COUNT(*) AS total_users
FROM users;

-- name: UpdateUserCustomerID :one
UPDATE users 
SET customer_uid = $2
WHERE id = $1
RETURNING id, user_id, name, email, is_verified, customer_uid, created_at;

-- name: UpdateUserClerkID :one
UPDATE users 
SET clerk_id = $2
WHERE id = $1
RETURNING id, user_id, clerk_id, name, email, is_verified, customer_uid, created_at;

-- name: UpdateUserNameAndRole :one
UPDATE users
SET name = $2, role = $3
WHERE user_id = $1
RETURNING *;

