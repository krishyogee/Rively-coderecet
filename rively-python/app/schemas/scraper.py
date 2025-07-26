# app/schemas/recommendations.py
from pydantic import BaseModel

class ScraperInput(BaseModel):
    customer_uid: str

class ScraperResponse(BaseModel):
    success: bool
