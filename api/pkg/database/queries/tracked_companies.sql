-- name: CreateTrackedCompany :one
INSERT INTO tracked_companies (
    name, domain, type, interests, customer_uid
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING  *;

-- name: GetAllTrackedCompanies :many
SELECT * FROM tracked_companies
WHERE customer_uid = $1;

-- name: UpdateTrackedCompany :one 
UPDATE tracked_companies
SET type = coalesce($2, tracked_companies.type),
    interests = coalesce($3, tracked_companies.interests),
    isactive = coalesce($4, tracked_companies.isactive)
WHERE tracked_company_uid = $1
RETURNING *;

-- name: DeleteTrackedCompany :exec
DELETE FROM tracked_companies
WHERE tracked_company_uid = $1;