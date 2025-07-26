import json
import aiohttp
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime

class CompanyContextExtractor:
    def __init__(self):
        """Initialize with Lyzr API configuration."""
        # Lyzr API configuration
        self.lyzr_api_url = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
        self.lyzr_api_key = "sk-default-0vXAp7xlIsAZ7Ocktmowe7DicKqNQGc0"
        self.agent_id = "6884518f1da3452f3d04668c"
        self.user_id = "akash.c@goml.io"
        self.session_id = "6884518f1da3452f3d04668c-1heboh2q31uh"
        
        self.logs_dir = Path("app/logs")
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.output_path = self.logs_dir / "customer_context.json"

    def _save_to_log_file(self, content: str, prefix: str) -> None:
        """Save content to a log file with timestamp."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.logs_dir / f"{prefix}_{timestamp}.txt"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Saved log file: {filename}")

    async def extract_customer_context(self, domain: str) -> Optional[Dict[str, Any]]:
        """Extract company context using Lyzr agent API."""
        print(f"\n=== Extracting Company Context from {domain} ===")
        self._save_to_log_file(f"Starting extraction for {domain}", "context_extraction_start")

        # Normalize domain - remove protocol if present for cleaner input
        clean_domain = domain.replace("https://", "").replace("http://", "")

        headers = {
            'Content-Type': 'application/json',
            'x-api-key': self.lyzr_api_key
        }
        
        payload = {
            "user_id": self.user_id,
            "agent_id": self.agent_id,
            "session_id": self.session_id,
            "message": clean_domain
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                print(f"🔍 Calling Lyzr agent for domain: {clean_domain}")
                self._save_to_log_file(f"Calling Lyzr API for: {clean_domain}", "lyzr_api_call")
                
                async with session.post(self.lyzr_api_url, headers=headers, json=payload) as response:
                    print(f"📡 API Response Status: {response.status}")
                    
                    if response.status == 200:
                        response_data = await response.json()
                        print("✅ Successfully received response from Lyzr agent")
                        
                        # Save raw response for debugging
                        self._save_to_log_file(json.dumps(response_data, indent=2), "lyzr_raw_response")
                        
                        # Extract the actual content from the response
                        content = None
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
                                extracted_data = json.loads(content)
                            except json.JSONDecodeError:
                                # If not JSON, create a structured response
                                extracted_data = {"raw_content": content, "domain": clean_domain}
                        else:
                            extracted_data = content if isinstance(content, dict) else {"content": content, "domain": clean_domain}
                        
                        # Save to file
                        with open(self.output_path, "w", encoding="utf-8") as f:
                            json.dump(extracted_data, f, indent=2, ensure_ascii=False)
                        print(f"\n✅ Saved to: {self.output_path}")
                        self._save_to_log_file(json.dumps(extracted_data, indent=2), "extracted_context")

                        # Print preview
                        print("--- 🧾 Clean Preview ---\n")
                        if isinstance(extracted_data, dict):
                            for k, v in extracted_data.items():
                                # Truncate long values for preview
                                display_value = str(v)[:100] + "..." if len(str(v)) > 100 else str(v)
                                print(f"🟢 {k}: {display_value}")
                        else:
                            print(f"🟢 Content: {str(extracted_data)[:200]}...")

                        return extracted_data
                        
                    else:
                        error_text = await response.text()
                        error_msg = f"API Error {response.status}: {error_text}"
                        print(f"❌ {error_msg}")
                        self._save_to_log_file(error_msg, f"error_{clean_domain.replace('.', '_')}")
                        return None
                        
        except aiohttp.ClientError as e:
            error_msg = f"Network error: {e}"
            print(f"❌ {error_msg}")
            self._save_to_log_file(error_msg, f"error_{clean_domain.replace('.', '_')}")
            return None
        except Exception as e:
            error_msg = f"Unexpected error: {e}"
            print(f"❌ {error_msg}")
            self._save_to_log_file(error_msg, f"error_{clean_domain.replace('.', '_')}")
            return None