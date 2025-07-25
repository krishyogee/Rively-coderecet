-- name: GetAllCompanyUpdates :many
SELECT 
  cu.*, 
  tc.domain
FROM 
  company_updates cu
JOIN 
  tracked_companies tc 
  ON cu.tracked_company_uid = tc.tracked_company_uid
WHERE 
  tc.customer_uid = $1;
