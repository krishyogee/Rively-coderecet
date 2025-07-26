import requests
import http.client
import json
import urllib.parse
from datetime import datetime, timedelta
from typing import Optional
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.repository.tracked_companies import TrackedCompanyRepository
from app.repository.customers import CustomerRepository
from app.schemas.company_updates import TrackedCompanyLinkedInUpdate, TrackedCompanyUpdateCreate
from app.repository.tracked_company_updates import TrackedCompanyUpdateRepository
from app.services.llm_update_generator import convert_data_into_updates_llm
from app.config import settings

class LLMService:
    def __init__(self):
        self.llm = ChatGroq(model="llama3-70b-8192", groq_api_key=settings.GROQ_API_KEY)
        self.output_parser = JsonOutputParser()

    async def invoke_llm_chain(self, prompt_template: str, input_variables: dict, format_instructions: str) -> Optional[dict]:
        prompt_template = PromptTemplate(
            template=f"{prompt_template}\n{{format_instructions}}\n",
            input_variables=list(input_variables.keys()),
            partial_variables={"format_instructions": format_instructions},
        )
        chain = prompt_template | self.llm | self.output_parser
        try:
            return chain.invoke(input_variables)
        except Exception as e:
            print(f"Error invoking LLM chain: {e}")
            return None


class LinkedInService:

    def __init__(self, company_update_repo: TrackedCompanyUpdateRepository):
        self.company_update_repo = company_update_repo
        self.llm_service = LLMService()

    async def get_company_linkedin_url(self, domain: str) -> Optional[str]:
        """
        Get the LinkedIn company page URL using SERP API and LLM.
        """
        # Use SERP API to search for LinkedIn company page
        try:
            conn = http.client.HTTPSConnection("real-time-web-search.p.rapidapi.com")
            headers = {
                'x-rapidapi-key': settings.RAPID_KEY,
                'x-rapidapi-host': "real-time-web-search.p.rapidapi.com"
            }
            
            # Encode the search query
            search_query = urllib.parse.quote(f"{domain} company linkedin page")
            conn.request("GET", f"/search-advanced?q={search_query}&num=10&start=0&gl=us&hl=en&device=desktop&nfpr=0", headers=headers)
            
            res = conn.getresponse()
            data = res.read()
            
            if res.status != 200:
                print(f"Error fetching search results: {res.status} - {data.decode('utf-8')}")
                return None
                
            response_data = json.loads(data.decode("utf-8"))
            
            if response_data.get('status') != 'OK':
                print(f"Search API returned error: {response_data}")
                return None
                
            search_results = response_data.get('data', [])
            
            # Format results for LLM
            formatted_results = []
            for result in search_results:
                formatted_results.append({
                    'title': result.get('title', ''),
                    'snippet': result.get('snippet', ''),
                    'url': result.get('url', ''),
                    'source': result.get('source', '')
                })
            
        except Exception as e:
            print(f"Error during search: {e}")
            return None

        with open("app/services/prompts/linkedin_company_url_retriever_prompt.txt", "r") as file:
            base_prompt = file.read()

        response = await self.llm_service.invoke_llm_chain(
            base_prompt,
            {"company": domain, "search_results": formatted_results},
            self.llm_service.output_parser.get_format_instructions()
        )
        return response.get("url") if response else None

    def _parse_posted_date(self, posted_date_str: str) -> datetime:
        """
        Parse the postedDate from the new LinkedIn API format.
        Example input: "2025-07-25 16:45:02"
        Example output: datetime object for 2025-07-25 16:45:02
        """
        try:
            # Parse the datetime string directly
            parsed_date = datetime.strptime(posted_date_str, "%Y-%m-%d %H:%M:%S")
            return parsed_date
        except ValueError as e:
            print(f"Error parsing postedDate '{posted_date_str}': {e}")
            # Fallback to current UTC time if parsing fails
            return datetime.utcnow()

    async def scrape_linkedin(self, customer_uid: str, tracked_company_repo: TrackedCompanyRepository, customer_repo: CustomerRepository):
        """
        Scrape LinkedIn data for all tracked companies of a given product.
        Stops processing posts for a company when 3 consecutive posts are older than one week.
        Uses the new LinkedIn API and stores LinkedIn URL in linkedin_username field.
        """
        print(f"Fetching tracked companies for customer_uid: {customer_uid}")
        tracked_companies = await tracked_company_repo.get_all_tracked_companies(customer_uid)
        print(f"Found {len(tracked_companies)} tracked companies.")

        for tracked_company in tracked_companies:
            print(f"Processing tracked company: {tracked_company.tracked_company_uid} (Domain: {tracked_company.domain})")

            # Fetch LinkedIn URL if not already available
            linkedin_url = tracked_company.linkedin_username
            
            if linkedin_url == 'false':
                print(f"Skipping tracked company {tracked_company.tracked_company_uid} as linkedin_username is 'false'.")
                continue

            if not linkedin_url:
                print(f"No LinkedIn URL found for tracked company {tracked_company.tracked_company_uid}. Fetching from search...")
                try:
                    linkedin_url = await self.get_company_linkedin_url(tracked_company.domain)
                    if linkedin_url and linkedin_url != 'false':
                        print(f"Fetched LinkedIn URL: {linkedin_url}")
                        await tracked_company_repo.update_tracked_company_with_linkedin_username(
                            tracked_company.tracked_company_uid,
                            TrackedCompanyLinkedInUpdate(linkedin_username=linkedin_url)
                        )
                    else:
                        print(f"Failed to fetch LinkedIn URL for tracked company {tracked_company.tracked_company_uid}.")
                        # Store 'false' to avoid repeated attempts
                        await tracked_company_repo.update_tracked_company_with_linkedin_username(
                            tracked_company.tracked_company_uid,
                            TrackedCompanyLinkedInUpdate(linkedin_username='false')
                        )
                        continue
                except Exception as e:
                    print(f"Error fetching LinkedIn URL: {e}")
                    continue

            # Use LinkedIn URL to fetch posts
            if linkedin_url and linkedin_url != 'false':
                print(f"Fetching LinkedIn posts for URL: {linkedin_url}")
                try:
                    # Use the new LinkedIn API
                    conn = http.client.HTTPSConnection("linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com")
                    headers = {
                        'x-rapidapi-key': settings.RAPID_KEY,
                        'x-rapidapi-host': "linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com"
                    }
                    
                    # URL encode the LinkedIn URL
                    encoded_url = urllib.parse.quote(linkedin_url, safe='')
                    conn.request("GET", f"/company/posts?company_name={encoded_url}", headers=headers)
                    
                    res = conn.getresponse()
                    data = res.read()
                    
                    if res.status != 200:
                        print(f"Error fetching LinkedIn posts: {res.status} - {data.decode('utf-8')}")
                        continue

                    response_data = json.loads(data.decode("utf-8"))
                    
                    if not response_data.get('success'):
                        print(f"API returned error: {response_data.get('message', 'Unknown error')}")
                        continue

                    posts = response_data.get('data', {}).get('posts', [])
                    
                    one_month_ago = datetime.utcnow() - timedelta(days=30)
                    one_week_ago = datetime.utcnow() - timedelta(days=7)
                    consecutive_old_posts = 0

                    for post in posts:
                        posted_at_info = post.get('posted_at', {})
                        posted_date_str = posted_at_info.get('date', '')
                        
                        if not posted_date_str:
                            print(f"No posted date found for post: {post.get('text', '')[:50]}... Skipping.")
                            continue

                        post_timestamp = self._parse_posted_date(posted_date_str)

                        # Check if post is older than one week
                        if post_timestamp < one_week_ago:
                            consecutive_old_posts += 1
                            print(f"Old post detected: {post.get('text', '')[:50]}... (Posted: {post_timestamp})")
                            if consecutive_old_posts >= 3:
                                print(f"Found 3 consecutive posts older than one week for {tracked_company.domain}. Stopping post processing.")
                                break
                            continue  # Skip processing this post

                        # Reset counter for recent posts
                        consecutive_old_posts = 0

                        # Process posts within one month
                        if post_timestamp >= one_month_ago:
                            post_text = post.get('text', '')
                            post_url = post.get('post_url', '')
                            
                            if post_text:
                                update = await convert_data_into_updates_llm(
                                    post_text,
                                    source_type="Company's LinkedIn Page",
                                    company_type=tracked_company.type,
                                    company=tracked_company.name,
                                    tracked_company_uid=tracked_company.tracked_company_uid,
                                    customer_repo=customer_repo,
                                    customer_uid=customer_uid
                                )

                                if update.title == "Not useful for product manager":
                                    print("Skipping post: Not useful for product manager")
                                    continue

                                company_update_data = TrackedCompanyUpdateCreate(
                                    title=update.title,
                                    description=update.description,
                                    competitor_name=tracked_company.name,
                                    source_url=post_url,
                                    source_type="Company's LinkedIn Page",
                                    competitor_domain=tracked_company.domain,
                                    tracked_company_uid=tracked_company.tracked_company_uid,
                                    customer_uid=customer_uid,
                                    source="tracked_company's LinkedIn Page",
                                    posted_at=post_timestamp,
                                    update_category=update.update_category,
                                    update_type=update.update_type,
                                    action_point=update.action_point
                                )
                                print(company_update_data)

                                try:
                                    await self.company_update_repo.create_company_update(company_update=company_update_data)
                                    print(f"Successfully stored update for post: {post_text[:50]}...")
                                except Exception as e:
                                    print(f"Failed to store update. Error: {e}")

                except Exception as e:
                    print(f"Error processing LinkedIn posts for {tracked_company.domain}: {e}")
                    continue

            print(f"Processing complete for tracked company: {tracked_company.domain}")

        print("Scraping process completed.")
        return True