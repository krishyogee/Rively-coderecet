from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scraper
from app.routers import newsletter 
from app.db.database import database
from dotenv import load_dotenv
load_dotenv()

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # yield
    # Startup logic
    await database.connect()
    yield
    # Shutdown logic
    await database.disconnect()

# Create FastAPI app with lifespan
app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["GET", "POST", "OPTIONS"],  # Allow specific HTTP methods
    allow_headers=["Origin", "Content-Type", "Accept", "Authorization"],  # Allow specific headers
    expose_headers=["Content-Length"],  # Expose specific headers
    allow_credentials=True,  # Allow credentials (e.g., cookies)
    max_age=12 * 60 * 60,  # Max age for preflight requests (12 hours)
)

# Add auth middleware
#app.middleware("http")(auth_middleware)
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
# Include the router
# app.include_router(feedback.router)
# app.include_router(dev_space.router)
app.include_router(scraper.router)
app.include_router(newsletter.router)
