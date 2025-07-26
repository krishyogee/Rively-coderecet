from databases import Database
from app.schemas.email_recipients import EmailRecipient
from typing import Optional, List

class EmailRecipientRepository:
    def __init__(self, db: Database):
        self.db = db

    async def get_all_email_recipients(self, customer_uid: Optional[str] = None) -> List[EmailRecipient]:
        """
        Fetch all email recipients from the 'email_recipients' table, optionally filtered by customer_uid.
        Returns a list of EmailRecipient objects.
        
        Args:
            customer_uid: Optional filter to get email recipients for a specific customer
            
        Returns:
            List of EmailRecipient objects
        """
        query = """
            SELECT id, customer_uid, name, email, is_active
            FROM email_recipients
            WHERE is_active = true
        """
        values = {}
        
        if customer_uid:
            query += " AND customer_uid = :customer_uid"
            values["customer_uid"] = str(customer_uid)
            
        results = await self.db.fetch_all(query=query, values=values)
        
        return [
            EmailRecipient(
                id=row["id"],
                customer_uid=row["customer_uid"],
                name=row["name"],
                email=row["email"],
                is_active=row["is_active"]
            )
            for row in results
        ]
