from databases import Database
from app.schemas.customers import CustomerContextUpdate

class CustomerRepository:
    def __init__(self, db: Database):
        self.db = db

    async def update_customer_with_customer_context(self, customer_uid: str, company_update: CustomerContextUpdate):
            query = """
                UPDATE customers
                SET customer_context = :customer_context
                WHERE customer_uid = :customer_uid
            """
            values = {
                "customer_context": company_update.customer_context,
                "customer_uid": customer_uid
            }
            await self.db.execute(query=query, values=values)


    async def get_customer_context(self, customer_uid: str) -> str:
            query = """
                SELECT customer_context FROM customers WHERE customer_uid = :customer_uid
            """
            values = {"customer_uid": customer_uid}
            result = await self.db.fetch_one(query=query, values=values)
            return result["customer_context"]

    async def get_customer_company_domain(self, customer_uid: str) -> str:
            query = """
                SELECT domain FROM customers WHERE customer_uid = :customer_uid
            """
            values = {"customer_uid": customer_uid}
            result = await self.db.fetch_one(query=query, values=values)
            return result["domain"]
    
    async def get_customer_details(self, customer_uid: str):
            query = """
                SELECT c.customer_uid, u.name, c.domain, c.email 
                FROM customers c
                JOIN users u ON c.customer_uid = u.customer_uid
                WHERE c.customer_uid = :customer_uid
            """
            values = {"customer_uid": customer_uid}
            result = await self.db.fetch_one(query=query, values=values)
            return result