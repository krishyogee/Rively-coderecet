import requests
from datetime import datetime, timedelta
from typing import List
from app.repository.tracked_companies import TrackedCompanyRepository
from app.repository.customers import CustomerRepository
from app.schemas.company_updates import TrackedCompanyUpdateCreate
from app.repository.tracked_company_updates import TrackedCompanyUpdateRepository
from app.services.llm_update_generator import convert_data_into_updates_llm
from app.config import settings
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CrawlResult, BrowserConfig

class NewsService:

    def __init__(self, company_update_repo: TrackedCompanyUpdateRepository):
        self.company_update_repo = company_update_repo

    async def _scrape_article_content(self, article_url: str) -> str:
        """
        Scrape the full content from a news article URL using crawl4ai
        Returns the article text content or empty string if scraping fails
        """
        try:
            async with AsyncWebCrawler(config=BrowserConfig(
                viewport_height=800,
                viewport_width=1200,
                headless=True,
                verbose=False,
            )) as crawler:
                results: List[CrawlResult] = await crawler.arun(
                    url=article_url,
                    config=CrawlerRunConfig(cache_mode="bypass")
                )
                
                for result in results:
                    if result.success and result.markdown:
                        # Return the markdown content which contains the article text
                        content = result.markdown.raw_markdown
                        print(f"Successfully scraped content from {article_url} ({len(content)} chars)")
                        return content[:5000]  # Limit to 5000 chars to avoid token limits
                    else:
                        print(f"Failed to scrape content from {article_url}")
                        return ""
        except Exception as e:
            print(f"Error scraping article content from {article_url}: {e}")
            return ""

    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """
        Parse the timestamp from Google News API (Unix milliseconds) to database format.
        Example input: "1677744000000"
        Example output: datetime object
        """
        try:
            # Convert milliseconds to seconds and parse
            timestamp_sec = int(timestamp_str) / 1000
            parsed_date = datetime.fromtimestamp(timestamp_sec)
            return parsed_date
        except (ValueError, TypeError) as e:
            print(f"Error parsing timestamp '{timestamp_str}': {e}")
            # Fallback to current UTC time if parsing fails
            return datetime.utcnow()

    async def scrape_news(self, customer_uid: str, tracked_company_repo: TrackedCompanyRepository, customer_repo: CustomerRepository):
        """
        Scrape Google News data for all tracked companies of a given customer.
        Stops processing articles for a company when 3 consecutive articles are older than one month.
        Converts timestamp to database timestamp format before saving.
        """
        print(f"Fetching tracked companies for customer_uid: {customer_uid}")
        tracked_companies = await tracked_company_repo.get_all_tracked_companies(customer_uid)
        print(f"Found {len(tracked_companies)} tracked companies.")

        for tracked_company in tracked_companies:
            print(f"Processing tracked company: {tracked_company.tracked_company_uid} (Domain: {tracked_company.domain})")

            # Fetch Google News articles
            url = "https://google-news13.p.rapidapi.com/search"
            headers = {
                "x-rapidapi-key": settings.RAPID_KEY,
                "x-rapidapi-host": "google-news13.p.rapidapi.com"
            }
            querystring = {"keyword": tracked_company.domain, "lr": "en-US"}

            try:
                response = requests.get(url, headers=headers, params=querystring)
                if response.status_code != 200:
                    print(f"Error fetching news articles: {response.status_code} - {response.text}")
                    continue

                data = response.json().get('items', [])
                three_months_ago = datetime.utcnow() - timedelta(days=100)
                consecutive_old_articles = 0

                for article in data:
                    timestamp_str = article.get('timestamp', '')
                    if not timestamp_str:
                        print(f"No timestamp found for article: {article.get('title', '')[:50]}... Skipping.")
                        continue

                    article_timestamp = self._parse_timestamp(timestamp_str)

                    # Check if article is older than one month
                    if article_timestamp < three_months_ago:
                        consecutive_old_articles += 1
                        print(f"Old article detected: {article.get('title', '')[:50]}... (Posted: {article_timestamp})")
                        if consecutive_old_articles >= 3:
                            print(f"Found 3 consecutive articles older than one month for {tracked_company.domain}. Stopping article processing.")
                            break
                        continue  # Skip processing this article

                    # Reset counter for recent articles
                    consecutive_old_articles = 0

                    # Process articles within one month
                    article_snippet = article.get('snippet', '')
                    article_url = article.get('newsUrl', '')
                    article_title = article.get('title', '')
                    
                    if article_url:
                        print(f"Scraping full content from: {article_url}")
                        # Scrape the full article content instead of using just the snippet
                        article_content = await self._scrape_article_content(article_url)
                        
                        # If scraping fails, fall back to snippet
                        if not article_content and article_snippet:
                            article_content = article_snippet
                            print(f"Falling back to snippet for {article_url}")
                        
                        if article_content:
                            update = await convert_data_into_updates_llm(
                                article_content,  # Use full scraped content instead of snippet
                                source_type="Google News",
                                company_type=tracked_company.type,
                                company=tracked_company.name,
                                tracked_company_uid=tracked_company.tracked_company_uid,
                                customer_repo=customer_repo,
                                customer_uid=customer_uid
                            )

                            company_update_data = TrackedCompanyUpdateCreate(
                                title=article_title,
                                description=update.description,
                                source_type="Google News",
                                source_url=article_url,
                                posted_at=article_timestamp,  # Use parsed timestamp
                                update_category=update.update_category,
                                update_type=update.update_type,
                                tracked_company_uid=tracked_company.tracked_company_uid,
                                action_point=update.action_point
                            )
                            print(company_update_data)

                            try:
                                await self.company_update_repo.create_company_update(company_update=company_update_data)
                                print(f"Successfully stored update for article: {article_title[:50]}...")
                            except Exception as e:
                                print(f"Failed to store update. Error: {e}")
                        else:
                            print(f"No content available for article: {article_title[:50]}... Skipping.")

                print(f"Processing complete for tracked company: {tracked_company.domain}")

            except Exception as e:
                print(f"Error processing news for {tracked_company.domain}: {e}")
                continue

        print("News scraping process completed.")
        return True