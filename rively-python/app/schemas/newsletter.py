from pydantic import BaseModel, EmailStr

class NewsletterRequest(BaseModel):
    customer_uid: str
    
class NewsletterResponse(BaseModel):
    success: bool
