class NewsletterRepository:
    def __init__(self, db):
        self.db = db

    async def insert_newsletter(self, newsletter_uid, file_path, customer_uid, department_uid, created_at):
        query = """
        INSERT INTO newsletters (newsletter_uid, file_path, customer_uid, department_uid, created_at)
        VALUES (:newsletter_uid, :file_path, :customer_uid, :department_uid, :created_at)
        """
        values = {
            "newsletter_uid": newsletter_uid,
            "file_path": file_path,
            "customer_uid": customer_uid,
            "department_uid": department_uid,
            "created_at": created_at
        }
        await self.db.execute(query=query, values=values)