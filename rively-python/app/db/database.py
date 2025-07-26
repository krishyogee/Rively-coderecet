# app/db/database.py
from app.config import settings
from databases import Database

# from config import settings


# Use the DATABASE_URL from app.config
database = Database(settings.DATABASE_URL)

async def get_db():
    await database.connect()
    try:
        yield database
    finally:
        await database.disconnect()