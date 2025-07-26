# FastAPI Server

This repository contains the backend Python server built using FastAPI.

## Directory Structure

app/  
├── main.py                  # Entry point for the FastAPI application  
├── config.py                # Configuration settings for the application  
├── dependency.py            # Dependency injection setup  
├── middleware/  
│   └── auth.py              # Middleware for authentication  
├── routers/  
│   └── name.py              # API route handlers  
├── services/  
│   └── name.py              # Business logic layer  
├── repository/  
│   └── name.py              # Database interaction layer (CRUD operations)  
├── schemas/  
│   └── name.py              # Pydantic models for request/response validation  
├── db/  
│   └── database.py          # Database connection setup  
├── utils/  
│   └── name.py              # Utility functions and helpers  
env/                         # Virtual environment  
requirements.txt             # Project dependencies  
.gitignore                   # Git ignore file  
 
## Installation and Setup (Local)

Clone the repository.  
Create a virtual environment and activate it.  
Install dependencies => pip install -r requirements.txt  
Setup environment variables in config.py  

## Running the project:
Set up environment variables using .env or in config.py  
Start the FastAPI server => uvicorn app.main:app --reload  

This starts the server on http://127.0.0.1:8000/ with hot reload.  

## How an api call works?

Client Sends Request → API request reaches FastAPI (main.py).  
Middleware Processes the Request → Authentication and validation occur.  
Router Forwards Request → Calls the appropriate service function.  
Service Layer Processes Logic → Business rules are applied.  
Repository Layer Interacts with Database → Retrieves or updates data.  
Response is Structured with Schemas → Data is validated and sent back to the client.  

## How to write an api?

Setup necessary variables in config.py or in .env  

Config.py structure:  
from pydantic_settings import BaseSettings  

class Settings(BaseSettings):  
	VARIABLE_NAME: data-type = "..."  
	DEBUG: bool = True  
	class Config:  
        	env_file = ".env"  
 
settings = Settings()  

To use an env variable, use below import statement:  
from app.config import settings  

To access a variable, use:  
settings.VARIABLE_NAME  

Maintain migrations in Go and remember that we just access the db through fastAPI server  
Define a schema in schemas folder for input and response validation  
Create a repository for DB interactions(CRUD)  
Define an API router in routers folder and register the router in main.py  
Implement business logic in service layer(services folder)  
Dependencies( repo on DB and service on repo) should be written in dependency.py. This acts as a layer for dependency injection.




