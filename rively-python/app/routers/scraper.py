# app/routers/scraper.py
from fastapi import APIRouter, Depends
from app.schemas.scraper import ScraperInput, ScraperResponse
from app.services.scraper import ScraperService
from app.dependency import get_scraper_service

router = APIRouter()

@router.post("/scraper/", response_model=ScraperResponse)
async def scrape_tracked_companies(
    scraper: ScraperInput,
    scraper_service: ScraperService = Depends(get_scraper_service), 
):
    # Print the input data for debugging
    print(f"Received request with customer_uid: {scraper.customer_uid}")

    # Call the scraper service
    print("Calling scraper_service.scrape_data...")
    success = await scraper_service.scrape_data(scraper.customer_uid)

    # Print the result for debugging
    print(f"Scraping result: {success}")

    # Return the result
    return success