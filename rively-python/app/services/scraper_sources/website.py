import requests
import http.client
import json
import urllib.parse
from typing import Optional
from bs4 import BeautifulSoup
import datetime
from urllib.parse import urljoin
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.repository.tracked_companies import TrackedCompanyRepository
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


class ChangelogScraper:
    def __init__(self, company_update_repo: TrackedCompanyUpdateRepository, customer_repo):
        self.company_update_repo = company_update_repo
        self.customer_repo = customer_repo
        self.llm_service = LLMService()

    async def get_company_changelogs_url(self, domain: str) -> Optional[str]:
        """
        Get the company changelogs page URL using SERP API and LLM.
        """
        # Use SERP API to search for changelog page
        try:
            conn = http.client.HTTPSConnection("real-time-web-search.p.rapidapi.com")
            headers = {
                'x-rapidapi-key': settings.RAPID_KEY,
                'x-rapidapi-host': "real-time-web-search.p.rapidapi.com"
            }
            
            # Encode the search query
            search_query = urllib.parse.quote(f"changelogs page of {domain} saas tool 2025")
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

        with open("app/services/prompts/changelogs_page_url_retriever_prompt.txt", "r") as file:
            base_prompt = file.read()

        response = await self.llm_service.invoke_llm_chain(
            base_prompt,
            {"company": domain, "search_results": formatted_results},
            self.llm_service.output_parser.get_format_instructions()
        )
        return response.get("url") if response else None

    def extract_text_with_links(self, soup, base_url: str) -> str:
        text_with_links = []
        for element in soup.descendants:
            if element.name == 'a':
                link = element.get('href', '')
                link_text = element.get_text(strip=True)
                if link and link_text:
                    absolute_link = urljoin(base_url, link)
                    text_with_links.append(f"[{link_text}]({absolute_link})")
            elif isinstance(element, str):
                text_with_links.append(element.strip())
        return ' '.join(text_with_links)

    async def scrape_changelog_page(self, url: str) -> Optional[dict]:
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Failed to retrieve the webpage. Status code: {response.status_code}")

        soup = BeautifulSoup(response.content, 'html.parser')
        for element in soup(['script', 'style', 'meta', 'link']):
            element.decompose()

        text_with_links = self.extract_text_with_links(soup, url)
        half_length = len(text_with_links) // 2
        first_half = text_with_links[:half_length]

        with open("app/services/prompts/changelogs_1st_layer_prompt.txt", "r") as file:
            base_prompt = file.read()

        return await self.llm_service.invoke_llm_chain(
            base_prompt,
            {"scraped_text": first_half, "one_week_ago": datetime.datetime.now() - datetime.timedelta(days=7)},
            self.llm_service.output_parser.get_format_instructions()
        )

    async def scrape_detailed_changelog(self, detailed_link: str) -> Optional[dict]:
        response = requests.get(detailed_link)
        if response.status_code != 200:
            raise Exception(f"Failed to retrieve the webpage. Status code: {response.status_code}")

        soup = BeautifulSoup(response.content, 'html.parser')
        for element in soup(['script', 'style', 'meta', 'link']):
            element.decompose()

        text_with_links = self.extract_text_with_links(soup, detailed_link)
        half_length = len(text_with_links) // 2
        first_half = text_with_links[:half_length]

        with open("app/services/prompts/changelogs_2nd_layer_prompt.txt", "r") as file:
            base_prompt = file.read()

        return await self.llm_service.invoke_llm_chain(
            base_prompt,
            {"scraped_text": first_half, "one_week_ago": datetime.datetime.now() - datetime.timedelta(days=7)},
            self.llm_service.output_parser.get_format_instructions()
        )

    async def store_company_update(self, text: str, source_url: str, customer_uid: str, tracked_company_uid: str, competitor_name: str, competitor_domain: str, competitor_type: str):
        update = await convert_data_into_updates_llm(
            text,
            source_type="Company's Changelog Page",
            company=competitor_name,
            company_type=competitor_type,
            tracked_company_uid=tracked_company_uid,
            customer_uid=customer_uid,
            customer_repo=self.customer_repo
        )
    
        if update.title == "Not useful for product manager":
            print("Skipping post: Not useful for product manager")
            return

        company_update_data = TrackedCompanyUpdateCreate(
            title=update.title,
            description=update.description,
            competitor_name=competitor_name,
            source_url=source_url,
            source_type="Company's Changelog Page",
            competitor_domain=competitor_domain,
            tracked_company_uid=tracked_company_uid,
            customer_uid=customer_uid,
            source="tracked_company's Changelogs Page",
            posted_at=datetime.datetime.now(),
            update_category=update.update_category,
            update_type=update.update_type,
            action_point=update.action_point
        )

        try:
            await self.company_update_repo.create_company_update(company_update=company_update_data)
            print(f"Successfully stored update for post: {text}")
        except Exception as e:
            print(f"Failed to store update. Error: {e}")

    async def scrape_changelog(self, customer_uid: str, competitor_repo: TrackedCompanyRepository) -> bool:
        print(f"Scraping Changelog data for customer_uid: {customer_uid}")
        tracked_companies = await competitor_repo.get_all_tracked_companies(customer_uid)
        print(f"Found {len(tracked_companies)} tracked_companies.")

        for tracked_company in tracked_companies:
            print(f"Processing tracked_company: {tracked_company.tracked_company_uid} (Domain: {tracked_company.domain})")

            changelogs_url = tracked_company.changelogs_url

            if changelogs_url == 'false':
                print(f"Skipping tracked_company {tracked_company.tracked_company_uid} as changelogs_url is 'false'.")
                continue

            if not changelogs_url:
                print(f"No Changelogs URL found for tracked_company {tracked_company.tracked_company_uid}. Fetching from API...")
                changelogs_url = await self.get_company_changelogs_url(tracked_company.domain)
                if changelogs_url:
                    print(f"Fetched changelogs_url: {changelogs_url}")
                    await competitor_repo.update_tracked_company_with_changelogs_url(
                        tracked_company.tracked_company_uid,
                        TrackedCompanyLinkedInUpdate(changelogs_url=changelogs_url)
                    )
                else:
                    print(f"Failed to fetch changelogs_url for tracked_company {tracked_company.tracked_company_uid}.")
                    continue

            if changelogs_url:
                print(f"Fetching changelog data for URL: {changelogs_url}")
                response_1 = await self.scrape_changelog_page(changelogs_url)
                if response_1 and response_1.get("date"):
                    llm_text = f"Changelog for {response_1['date']} is as follows: {response_1['all_text_data']}"
                    await self.store_company_update(
                        llm_text,
                        changelogs_url,
                        customer_uid,
                        tracked_company.tracked_company_uid,
                        tracked_company.name,
                        tracked_company.domain,
                        tracked_company.type  
                    )
                else:
                    detailed_link = response_1.get("http_link") if response_1 else None
                    if detailed_link:
                        response_2 = await self.scrape_detailed_changelog(detailed_link)
                        if response_2 and response_2.get("date"):
                            llm_text = f"Changelog for {response_2['date']} is as follows: {response_2['all_text_data']}"
                            await self.store_company_update(
                                llm_text,
                                changelogs_url,
                                customer_uid,
                                tracked_company.tracked_company_uid,
                                tracked_company.name,
                                tracked_company.domain,
                                tracked_company.type
                            )

            print(f"Processing complete for tracked_company: {tracked_company.domain}")

        print("Scraping process completed.")
        return True
