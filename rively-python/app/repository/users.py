from databases import Database
from app.schemas.users import User
from typing import Optional, List

class UserRepository:
    def __init__(self, db: Database):
        self.db = db

    async def get_all_users(self, customer_uid: Optional[str] = None) -> List[User]:
        """
        Fetch all users from the 'users' table, optionally filtered by customer_uid.
        Returns a list of User objects.
        
        Args:
            customer_uid: Optional filter to get users for a specific customer
            
        Returns:
            List of User objects
        """
        query = """
            SELECT id, customer_uid, name, email
            FROM users
        """
        values = {}
        
        if customer_uid:
            query += " WHERE customer_uid = :customer_uid"
            values["customer_uid"] = str(customer_uid)
            
        results = await self.db.fetch_all(query=query, values=values)
        
        return [
            User(
                id=row["id"],
                customer_uid=row["customer_uid"],
                name=row["name"],
                email=row["email"]
            )
            for row in results
        ]