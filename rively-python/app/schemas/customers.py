from pydantic import BaseModel

class CustomerContextUpdate(BaseModel):
    customer_context: str


