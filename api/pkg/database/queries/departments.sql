-- name: GetAllDepartments :many
SELECT * FROM departments;

-- name: GetDepartmentByUID :one
SELECT id, department_uid, name
FROM departments
WHERE department_uid = $1;

-- name: GetLeadershipUID :one
SELECT department_uid
FROM departments
WHERE name = 'Leadership';