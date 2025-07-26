from databases import Database
from app.schemas.tracked_companies import TrackedCompany
from app.schemas.company_updates import TrackedCompanyLinkedInUpdate

class TrackedCompanyRepository:
    def __init__(self, db: Database):
        self.db = db

    async def get_all_tracked_companies(self, customer_uid: str) -> list[TrackedCompany]:
        query = """
            SELECT * FROM tracked_companies WHERE customer_uid = :customer_uid AND isactive = true
        """
        values = {"customer_uid": customer_uid}
        result = await self.db.fetch_all(query=query, values=values)
        
        # Convert UUID to string for Pydantic validation
        return [
            TrackedCompany(
                tracked_company_uid=str(row["tracked_company_uid"]),  # Convert UUID to string
                customer_uid=str(row["customer_uid"]),  # Convert UUID to string
                domain=row["domain"],
                type=row["type"],
                linkedin_username=row["linkedin_username"],
                created_at=row["created_at"],
                name=row["name"],
                changelogs_url=row["changelogs_url"],
            )
            for row in result
        ]
    
    async def update_tracked_company_with_linkedin_username(self, tracked_company_uid: str, company_update: TrackedCompanyLinkedInUpdate):
        query = """
            UPDATE tracked_companies
            SET linkedin_username = :linkedin_username
            WHERE tracked_company_uid = :tracked_company_uid
        """
        values = {
            "linkedin_username": company_update.linkedin_username,
            "tracked_company_uid": tracked_company_uid
        }
        await self.db.execute(query=query, values=values)
    
    async def update_tracked_company_with_changelogs_url(self, tracked_company_uid: str, company_update: TrackedCompanyLinkedInUpdate):
        query = """
            UPDATE tracked_companies
            SET changelogs_url = :changelogs_url
            WHERE tracked_company_uid = :tracked_company_uid
        """
        values = {
            "changelogs_url": company_update.changelogs_url,
            "tracked_company_uid": tracked_company_uid
        }
        await self.db.execute(query=query, values=values)

    
   