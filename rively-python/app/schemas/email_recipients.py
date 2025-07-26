from pydantic import BaseModel, EmailStr
from uuid import UUID


class EmailRecipient(BaseModel):
    id: int
    customer_uid: UUID  
    name: str
    email: EmailStr
    is_active: bool
