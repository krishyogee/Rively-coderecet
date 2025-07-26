from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TrackedCompany(BaseModel):
    name: str
    domain: str
    type: str
    linkedin_username: Optional[str] = None
    created_at: datetime
    tracked_company_uid: str
    customer_uid: str
    changelogs_url: Optional[str] = None
    
 