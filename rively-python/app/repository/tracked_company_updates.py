from databases import Database
from app.schemas.company_updates import TrackedCompanyLinkedInUpdate, TrackedCompanyUpdateCreate
from typing import List
from datetime import datetime
from uuid import UUID


class TrackedCompanyUpdateRepository:
    def __init__(self, db: Database):
        self.db = db

    async def create_company_update(self, company_update: TrackedCompanyUpdateCreate) -> int:
        """
        Insert a new idea into the 'ideas' table.
        Returns the ID of the newly created idea.
        """
        query = """
            INSERT INTO company_updates (title, description, update_category, update_type, source_type, source_url, posted_at, tracked_company_uid, action_point)
            VALUES (:title, :description, :update_category, :update_type, :source_type, :source_url, :posted_at, :tracked_company_uid, :action_point)
            RETURNING id
        """
        values = {
            "title": company_update.title,
            "description": company_update.description,
            "update_category": company_update.update_category,
            "update_type": company_update.update_type,
            "source_type": company_update.source_type,
            "source_url": company_update.source_url,
            "posted_at": company_update.posted_at,
            "tracked_company_uid": company_update.tracked_company_uid,
            "action_point": company_update.action_point
        }

        result = await self.db.fetch_one(query=query, values=values)
        return result["id"]
    
    async def get_updates_for_companies(self, company_uids: List[str], since_date: datetime, limit: int = 5) -> List[TrackedCompanyLinkedInUpdate]:
        """
        Fetch recent updates for a list of company UIDs since a given date from the 'company_updates' table.
        Returns a list of TrackedCompanyLinkedInUpdate objects, limited to the specified number.
        """
        if not company_uids:
            return []

        # Convert string UUIDs to UUID objects if needed
        try:
            company_uids = [UUID(uid) for uid in company_uids]
        except ValueError as e:
            print(f"Invalid UUID format in company_uids: {e}")
            return []

        # Create a parameterized query with named placeholders
        placeholders = ",".join([f":uid{i+1}" for i in range(len(company_uids))])
        
        query = f"""
            SELECT id, title, description, update_category, update_type, source_type, 
                source_url, posted_at, tracked_company_uid, action_point
            FROM company_updates
            WHERE tracked_company_uid IN ({placeholders})
            AND posted_at >= :since_date
            ORDER BY posted_at DESC
            LIMIT :limit
        """
        
        # Prepare values as a dictionary
        values = {f"uid{i+1}": uid for i, uid in enumerate(company_uids)}
        values["since_date"] = since_date
        values["limit"] = limit
        
        print(f"Executing query: {query}")
        print(f"With values: {values}")
        
        try:
            results = await self.db.fetch_all(query=query, values=values)
            
            return [
                TrackedCompanyUpdateCreate(
                    title=row["title"],
                    description=row["description"],
                    update_category=row["update_category"],
                    update_type=row["update_type"],
                    source_type=row["source_type"],
                    source_url=row["source_url"],
                    posted_at=row["posted_at"],
                    tracked_company_uid=str(row["tracked_company_uid"]),
                    action_point=row["action_point"]
                )
                for row in results
            ]
        except Exception as e:
            print(f"Error fetching company updates: {str(e)}")
            return []