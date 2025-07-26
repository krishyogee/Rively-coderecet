# app/dependency.py
from fastapi import Depends
from databases import Database
from .repository.tracked_companies import TrackedCompanyRepository
from .repository.tracked_company_updates import TrackedCompanyUpdateRepository
from .repository.customers import CustomerRepository

from app.services.newsletter import NewsletterService
from .services.scraper import ScraperService

from .db.database import get_db

def get_scraper_repository(db: Database = Depends(get_db)) -> TrackedCompanyRepository:
    return TrackedCompanyRepository(db)

def get_company_update_repository(db: Database = Depends(get_db)) -> TrackedCompanyUpdateRepository:
    return TrackedCompanyUpdateRepository(db)

def get_customer_repository(db: Database = Depends(get_db)) -> CustomerRepository:
    return CustomerRepository(db)

def get_scraper_service(scraper_repo: TrackedCompanyRepository = Depends(get_scraper_repository), 
                        company_update_repo: TrackedCompanyUpdateRepository = Depends(get_company_update_repository),
                        customer_repo: CustomerRepository = Depends(get_customer_repository)) -> ScraperService:
    return ScraperService(scraper_repo, company_update_repo, customer_repo)

def get_newsletter_service(db: Database = Depends(get_db)):
    return NewsletterService(db)

