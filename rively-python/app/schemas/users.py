from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class User(BaseModel):
    id: int
    customer_uid: UUID  
    name: str
    email: EmailStr