from app.repository.tracked_companies import TrackedCompanyRepository
from app.schemas.scraper import ScraperResponse
from app.repository.tracked_company_updates import TrackedCompanyUpdateRepository
from app.repository.customers import CustomerRepository
from app.services.scraper_sources.linkedin import LinkedInService
from app.services.scraper_sources.website import ChangelogScraper
from app.services.scraper_sources.news import NewsService


class ScraperService:
    def __init__(self, scraper_repo: TrackedCompanyRepository, company_update_repo: TrackedCompanyUpdateRepository, customer_repo: CustomerRepository):
        self.scraper_repo = scraper_repo 
        self.company_update_repo = company_update_repo
        self.customer_repo = customer_repo

    async def scrape_data(self, customer_uid: str) -> ScraperResponse:
        # Print the input data for debugging
        print(f"Scraping data for customer_uid: {customer_uid}")

        # Call the LinkedIn scraper function
        print("Calling scrape_linkedin function...")
        linkedin_scraper = LinkedInService(company_update_repo=self.company_update_repo)
        linkedin_success = await linkedin_scraper.scrape_linkedin(customer_uid, self.scraper_repo, self.customer_repo)

        # Call the Changelog scraper function
        print("Calling scrape_changelog function...")
        changelog_scraper = ChangelogScraper(company_update_repo=self.company_update_repo, customer_repo=self.customer_repo)
        changelog_success = await changelog_scraper.scrape_changelog(customer_uid, self.scraper_repo)

        # Call the News scraper function
        # print("Calling scrape_news function...")
        # news_scraper = NewsService(company_update_repo=self.company_update_repo)
        # news_success = await news_scraper.scrape_news(customer_uid, self.scraper_repo, self.customer_repo)

        print(f"Scraping result: LinkedIn : {linkedin_success}, Changelog : {changelog_success}, News : ")

        if linkedin_success and changelog_success:
            return ScraperResponse(success=True)
        else :
            return ScraperResponse(success=False)
