-- name: CreateEmailRecipient :one
INSERT INTO email_recipients (name, email, department_uid, customer_uid)
VALUES ($1, $2, $3, $4)
RETURNING id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at;

-- name: GetEmailRecipientById :one
SELECT id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at
FROM email_recipients
WHERE id = $1;

-- name: GetEmailRecipientByUID :one
SELECT id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at
FROM email_recipients
WHERE email_recipient_uid = $1;

-- name: GetEmailRecipientByEmail :one
SELECT id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at
FROM email_recipients
WHERE email = $1;

-- name: ListEmailRecipientsByCustomer :many
SELECT id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at
FROM email_recipients
WHERE customer_uid = $1
ORDER BY created_at DESC;

-- name: ListEmailRecipientsByDepartment :many
SELECT id, email_recipient_uid, name, email, is_active, department_uid, customer_uid, created_at
FROM email_recipients
WHERE department_uid = $1
ORDER BY created_at DESC;

-- name: UpdateEmailRecipient :exec
UPDATE email_recipients
SET name = COALESCE($2, name),
    email = COALESCE($3, email),
    is_active = COALESCE($4, is_active),
    department_uid = COALESCE($5, department_uid)
WHERE email_recipient_uid = $1;

-- name: DeleteEmailRecipient :exec
DELETE FROM email_recipients
WHERE email_recipient_uid = $1;

