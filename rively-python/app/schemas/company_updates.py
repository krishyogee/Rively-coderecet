from pydantic import BaseModel
from typing import Optional
from datetime import datetime  # Import specific classes

class TrackedCompanyUpdateCreate(BaseModel):
    title: str
    description: str
    update_category: str
    update_type: str
    source_type: str
    source_url: str
    posted_at: datetime
    tracked_company_uid: str
    action_point: Optional[str] = None  

class TrackedCompanyLinkedInUpdate(BaseModel):
    linkedin_username: Optional[str] = None
    changelogs_url: Optional[str] = None

class LLMTrackedCompanyUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    update_type: Optional[str] = None
    update_category: Optional[str] = None
    actionable_and_useful: Optional[str] = None
    update_usefulness_score: Optional[int] = None
    action_point: Optional[str] = None


class TrackedCompanyContextUpdate(BaseModel):
    customer_context: str