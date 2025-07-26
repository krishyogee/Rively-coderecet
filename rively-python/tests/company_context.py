import json
import asyncio
import aiohttp
from pathlib import Path
from typing import Optional, Dict, Any

output_path = Path(__file__).parent / "company_context.json"

# Lyzr API configuration
LYZR_API_URL = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
LYZR_API_KEY = "sk-default-0vXAp7xlIsAZ7Ocktmowe7DicKqNQGc0"
AGENT_ID = "6884518f1da3452f3d04668c"
USER_ID = "akash.c@goml.io"
SESSION_ID = "6884518f1da3452f3d04668c-1heboh2q31uh"

async def extract_company_context(domain: str) -> Optional[Dict[str, Any]]:
    """
    Extract company context using Lyzr agent API
    
    Args:
        domain: Company domain (e.g., "attio.com")
    
    Returns:
        Dictionary containing company context or None if failed
    """
    print(f"\n=== Extracting Company Context for {domain} ===")
    
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': LYZR_API_KEY
    }
    
    payload = {
        "user_id": USER_ID,
        "agent_id": AGENT_ID,
        "session_id": SESSION_ID,
        "message": domain
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            print(f"🔍 Calling Lyzr agent for domain: {domain}")
            
            async with session.post(LYZR_API_URL, headers=headers, json=payload) as response:
                print(f"📡 API Response Status: {response.status}")
                
                if response.status == 200:
                    response_data = await response.json()
                    print("✅ Successfully received response from Lyzr agent")
                    
                    # Print raw response for debugging
                    print("Raw API response:")
                    print(json.dumps(response_data, indent=2))
                    print("-" * 50)
                    
                    # Extract the actual content from the response
                    # Adjust this based on the actual response structure from Lyzr
                    if 'message' in response_data:
                        content = response_data['message']
                    elif 'response' in response_data:
                        content = response_data['response']
                    elif 'data' in response_data:
                        content = response_data['data']
                    else:
                        content = response_data
                    
                    # Try to parse as JSON if it's a string
                    if isinstance(content, str):
                        try:
                            parsed_content = json.loads(content)
                            return parsed_content
                        except json.JSONDecodeError:
                            # If not JSON, return as raw content
                            return {"raw_content": content, "domain": domain}
                    else:
                        return content
                        
                else:
                    error_text = await response.text()
                    print(f"❌ API Error {response.status}: {error_text}")
                    return None
                    
    except aiohttp.ClientError as e:
        print(f"❌ Network error: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

async def save_company_context(domain: str, output_file: Optional[str] = None) -> bool:
    """
    Extract and save company context to a JSON file
    
    Args:
        domain: Company domain to analyze
        output_file: Optional custom output file path
    
    Returns:
        True if successful, False otherwise
    """
    context_data = await extract_company_context(domain)
    
    if context_data is None:
        print("❌ Failed to extract company context")
        return False
    
    # Determine output file
    if output_file:
        file_path = Path(output_file)
    else:
        # Create filename based on domain
        safe_domain = domain.replace(".", "_").replace("/", "_")
        file_path = Path(__file__).parent / f"{safe_domain}_context.json"
    
    try:
        # Save the extracted data to file
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(context_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Company context saved to: {file_path}")
        
        # Print clean preview
        print("--- 🧾 Context Preview ---\n")
        if isinstance(context_data, dict):
            for k, v in context_data.items():
                # Truncate long values for preview
                display_value = str(v)[:100] + "..." if len(str(v)) > 100 else str(v)
                print(f"🟢 {k}: {display_value}")
        else:
            print(f"🟢 Content: {str(context_data)[:200]}...")
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to save context data: {e}")
        return False

async def main():
    """
    Main function to demonstrate company context extraction
    """
    print("=== Lyzr Company Context Extraction ===")
    
    # Default domain - can be changed or made interactive
    domain = "macrosoftinc.com"
    
    # You can also make it interactive:
    # domain = input("Enter company domain (e.g., attio.com): ").strip()
    
    success = await save_company_context(domain)
    
    if success:
        print(f"\n=== Extraction Complete for {domain} ===")
    else:
        print(f"\n=== Extraction Failed for {domain} ===")

if __name__ == "__main__":
    asyncio.run(main())