import os
import json
import re
import requests
import logging
from datetime import datetime
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langsmith import traceable, Client, trace as run
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL
from app.config import settings
from app.schemas.company_updates import LLMTrackedCompanyUpdate
from app.services.customer_context import CompanyContextExtractor
from app.schemas.customers import CustomerContextUpdate
from app.repository.customers import CustomerRepository

# Set LangSmith environment variables
os.environ["LANGCHAIN_TRACING_V2"] = str(settings.LANGCHAIN_TRACING_V2)
os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT

# Initialize LangSmith client
client = Client(api_key=settings.LANGCHAIN_API_KEY)

# Setup logging directory
LOGS_DIR = "app/logs"
os.makedirs(LOGS_DIR, exist_ok=True)

def format_customer_context_for_prompt(customer_context) -> str:
    """Format customer context for use in prompts."""
    if customer_context is None:
        return "No context available"
    
    if isinstance(customer_context, dict):
        # Format dictionary as readable text
        formatted_lines = []
        for key, value in customer_context.items():
            # Convert snake_case to readable format
            readable_key = key.replace('_', ' ').title()
            formatted_lines.append(f"{readable_key}: {value}")
        return "\n".join(formatted_lines)
    
    return str(customer_context)

def clean_json_response(response_text: str, expected_keys: list = None) -> dict:
    """Clean and extract JSON from LLM response text."""
    print(f"DEBUG - clean_json_response called with:")
    print(f"  - response_text type: {type(response_text)}")
    print(f"  - response_text preview: {str(response_text)[:200]}...")
    print(f"  - expected_keys: {expected_keys}")
    
    try:
        # If it's already a dict, return it
        if isinstance(response_text, dict):
            print(f"DEBUG - Response is already a dict, returning as-is")
            return response_text
            
        # If it's a string, try to extract JSON
        if isinstance(response_text, str):
            print(f"DEBUG - Processing string response")
            # Remove markdown code blocks
            cleaned = re.sub(r'```json\s*|\s*```|```', '', response_text)
            cleaned = re.sub(r'^\s*[\w\s]*?\{', '{', cleaned, flags=re.MULTILINE)
            print(f"DEBUG - Cleaned text: {cleaned[:200]}...")
            
            # Try to find JSON object
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', cleaned)
            if json_match:
                json_str = json_match.group()
                print(f"DEBUG - Found JSON match: {json_str}")
                parsed = json.loads(json_str)
                print(f"DEBUG - Successfully parsed JSON: {parsed}")
                return parsed
            else:
                print(f"DEBUG - No JSON match found in cleaned text")
                
        # Fallback: return empty dict with expected keys
        print(f"DEBUG - Using fallback with expected keys")
        if expected_keys:
            fallback = {key: "" for key in expected_keys}
            print(f"DEBUG - Fallback dict: {fallback}")
            return fallback
        return {}
        
    except Exception as e:
        error_msg = f"Failed to clean JSON response: {e}"
        print(f"DEBUG - ERROR in clean_json_response: {error_msg}")
        logging.error(error_msg)
        if expected_keys:
            fallback = {key: "" for key in expected_keys}
            print(f"DEBUG - Exception fallback dict: {fallback}")
            return fallback
        return {}

def save_company_context_log(customer_uid: str, company_domain: str, context_data: dict):
    """Save company context to a dedicated log file for each customer."""
    try:
        log_file = os.path.join(LOGS_DIR, f"customer_context_{customer_uid}.txt")
        timestamp = datetime.now().isoformat()
        
        log_entry = f"""
========================================
Timestamp: {timestamp}
Customer UID: {customer_uid}
Company Domain: {company_domain}
Context Data:
{json.dumps(context_data, indent=2)}
========================================

"""
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
            
        logging.info(f"Company context saved to {log_file}")
        
    except Exception as e:
        logging.error(f"Failed to save company context log: {e}")

def save_threshold_trigger_log(customer_uid: str, company: str, threshold_data: str, agent_triggered: bool):
    """Save log when threshold check is positive and agents are triggered."""
    try:
        log_file = os.path.join(LOGS_DIR, "threshold_triggers.txt")
        timestamp = datetime.now().isoformat()
        
        log_entry = f"""
========================================
Timestamp: {timestamp}
Customer UID: {customer_uid}
Company: {company}
Threshold Data: {threshold_data}
Agent Triggered: {agent_triggered}
========================================

"""
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
            
        logging.info(f"Threshold trigger logged to {log_file}")
        
    except Exception as e:
        logging.error(f"Failed to save threshold trigger log: {e}")

def save_agent_output_log(customer_uid: str, company: str, agent_name: str, agent_output: str, success: bool):
    """Save agent output before passing to final layer."""
    try:
        log_file = os.path.join(LOGS_DIR, "agent_outputs.txt")
        timestamp = datetime.now().isoformat()
        
        log_entry = f"""
========================================
Timestamp: {timestamp}
Customer UID: {customer_uid}
Company: {company}
Agent Name: {agent_name}
Success: {success}
Agent Output:
{agent_output}
========================================

"""
        
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
            
        logging.info(f"Agent output logged to {log_file}")
        
    except Exception as e:
        logging.error(f"Failed to save agent output log: {e}")

@traceable(run_type="tool", metadata={"function": "call_agent_api"})
async def call_agent_api(agent_name: str, message: str) -> dict:
    """Make API call to the specified agent and return the response."""
    
    print(f"DEBUG - call_agent_api called with:")
    print(f"  - agent_name: '{agent_name}'")
    print(f"  - message length: {len(message) if message else 0}")
    print(f"  - message preview: '{message[:100]}...' " if message and len(message) > 100 else f"  - message: '{message}'")
    
    # Agent configurations
    agent_configs = {
        "Content Marketing Agent": {
            "agent_id": "686cf6114cba69cf109dfaaf",
            "session_id": "686cf6114cba69cf109dfaaf-fmqewle6bb5"
        },
        "Similar Client Discovery Agent": {
            "agent_id": "686cada6868e419e65c9ec21", 
            "session_id": "686cada6868e419e65c9ec21-ku9x9k8abpg"
        }
    }
    
    print(f"DEBUG - Available agents: {list(agent_configs.keys())}")
    
    if agent_name not in agent_configs:
        error_msg = f"Unknown agent: {agent_name}. Available: {list(agent_configs.keys())}"
        print(f"DEBUG - ERROR: {error_msg}")
        raise ValueError(error_msg)
    
    config = agent_configs[agent_name]
    print(f"DEBUG - Using config: {config}")
    
    url = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "sk-default-0vXAp7xlIsAZ7Ocktmowe7DicKqNQGc0"
    }
    
    payload = {
        "user_id": "akash.c@goml.io",
        "agent_id": config["agent_id"],
        "session_id": config["session_id"],
        "message": message
    }
    
    print(f"DEBUG - Making API call to: {url}")
    print(f"DEBUG - Payload: {payload}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"DEBUG - API response status: {response.status_code}")
        response.raise_for_status()
        
        response_data = response.json()
        print(f"DEBUG - API response data: {response_data}")
        
        result = {
            "success": True,
            "agent_output": response_data.get("response", "No response received from agent"),
            "raw_response": response_data
        }
        print(f"DEBUG - Returning successful result")
        return result
        
    except requests.exceptions.Timeout as e:
        error_msg = f"Timeout calling {agent_name} API after 30 seconds: {str(e)}"
        print(f"DEBUG - TIMEOUT ERROR: {error_msg}")
        logging.error(error_msg)
        return {
            "success": False,
            "agent_output": f"Agent API call timed out after 30 seconds",
            "error": "timeout"
        }
    except requests.exceptions.RequestException as e:
        error_msg = f"Error calling {agent_name} API: {str(e)}"
        print(f"DEBUG - REQUEST ERROR: {error_msg}")
        logging.error(error_msg)
        return {
            "success": False,
            "agent_output": f"Failed to get response from {agent_name}: {str(e)}",
            "error": str(e)
        }

@traceable(run_type="chain", metadata={"function": "convert_data_into_updates_llm"})
async def convert_data_into_updates_llm(
    text: str, 
    source_type: str, 
    company_type: str,
    company: str,
    tracked_company_uid: str,
    customer_repo: CustomerRepository,
    customer_uid: str
) -> LLMTrackedCompanyUpdate:
    
    # DEBUG: Print initial function call info
    print(f"\n=== DEBUG - convert_data_into_updates_llm STARTED ===")
    print(f"Company: {company}")
    print(f"Company Type: {company_type}")
    print(f"Source Type: {source_type}")
    print(f"Customer UID: {customer_uid}")
    print(f"Text length: {len(text) if text else 0}")
    print(f"=======================================================\n")
    
    # Save initial input data
    input_data = f"""Input Data:
        Text: {text[:200]}... (truncated)
        Source Type: {source_type}
        Company Type: {company_type}
        Company: {company}
        Tracked Company UID: {tracked_company_uid}
        Customer UID: {customer_uid}
        """

    # First Layer - Load base prompt
    try:
        with run(name="LoadBasePrompt", run_type="tool", metadata={"step": "prompt_loading"}):
            with open("app/services/prompts/update_generator_prompt.txt", "r") as file:
                base_prompt = file.read()
    except Exception as e:
        error_msg = f"Error loading base_prompt: {e}"
        logging.error(error_msg)
        raise Exception(error_msg)   

    # Configure Portkey headers - let Portkey manage model and provider
    portkey_headers = createHeaders(
        api_key=settings.PORTKEY_KEY
    )
    
    llm = ChatOpenAI(
        api_key="dummy-key-portkey-handles-routing", 
        base_url=PORTKEY_GATEWAY_URL,
        default_headers=portkey_headers,
        temperature=0.7
    )
    output_parser = JsonOutputParser(pydantic_object=LLMTrackedCompanyUpdate)
    
    prompt_template = PromptTemplate(
        template=f"{base_prompt}\n{{format_instructions}}\n",
        input_variables=["text", "source-type", "company-type", "company"],
        partial_variables={"format_instructions": output_parser.get_format_instructions()},
    )
    
    chain = prompt_template | llm | output_parser

    prompt_input = {
        "text": text,
        "source-type": source_type,
        "company-type": company_type,
        "company": company
    }

    try:
        with run(name="FirstLayerLLMCall", run_type="llm", metadata={"step": "first_layer", "model": "llama-3.3-70b-versatile"}):
            print(f"DEBUG - Calling first layer LLM with input: {prompt_input}")
            response = chain.invoke(
                prompt_input,
                config={
                    "metadata": {
                        "step": "first_layer",
                        "company": company,
                        "customer_uid": customer_uid,
                        "source_type": source_type
                    }
                }
            )
            print(f"DEBUG - First layer response: {response}")
            print(f"DEBUG - First layer response type: {type(response)}")
    except Exception as e:
        error_msg = f"Error invoking LLM chain: {e}"
        print(f"DEBUG - First layer error: {error_msg}")
        logging.error(error_msg)
        raise Exception(error_msg)
    
    # Handle response conversion
    if not isinstance(response, LLMTrackedCompanyUpdate):
        print(f"DEBUG - Converting response to LLMTrackedCompanyUpdate")
        actionable_value = response.get("actionable_and_useful", "false").lower()
        actionable_str = actionable_value if actionable_value in ['true', 'false'] else 'false'

        first_layer_response = LLMTrackedCompanyUpdate(
            title=response.get("title", ""),
            description=response.get("description", ""),
            update_type=response.get("update_type", ""),
            update_category=response.get("update_category", ""),
            actionable_and_useful=actionable_str,
            update_usefulness_score=response.get("update_usefulness_score", 0),
            action_point=response.get("action_point", "")
        )
    else:
        print(f"DEBUG - Response is already LLMTrackedCompanyUpdate")
        first_layer_response = response
        actionable_value = first_layer_response.actionable_and_useful.lower() if isinstance(first_layer_response.actionable_and_useful, str) else str(first_layer_response.actionable_and_useful).lower()
        first_layer_response.actionable_and_useful = actionable_value if actionable_value in ['true', 'false'] else 'false'

    print(f"DEBUG - First layer final response:")
    print(f"  - Title: {first_layer_response.title}")
    print(f"  - Update Type: {first_layer_response.update_type}")
    print(f"  - Update Category: {first_layer_response.update_category}")
    print(f"  - Actionable: {first_layer_response.actionable_and_useful}")
    print(f"  - Usefulness Score: {first_layer_response.update_usefulness_score}")

    # Get company context
    customer_domain = None
    try:
        with run(name="GetCustomerContext", run_type="tool", metadata={"step": "context_retrieval"}):
            customer_context_str = await customer_repo.get_customer_context(customer_uid)
            
            if customer_context_str is None:
                with run(name="ExtractCustomerContext", run_type="tool", metadata={"step": "context_extraction"}):
                    try:
                        extractor = CompanyContextExtractor()
                        customer_domain = await customer_repo.get_customer_company_domain(customer_uid)
                        context_json = await extractor.extract_customer_context(customer_domain)
                        await customer_repo.update_customer_with_customer_context(
                            customer_uid, CustomerContextUpdate(customer_context=json.dumps(context_json))
                        )
                        customer_context = context_json
                        
                        # Save company context to log file
                        save_company_context_log(customer_uid, customer_domain, context_json)
                    except Exception as extraction_error:
                        error_msg = f"Failed to extract customer context: {extraction_error}"
                        logging.error(error_msg)
                        customer_context = {"error": "Context extraction failed", "domain": customer_domain}
                        save_company_context_log(customer_uid, customer_domain or "unknown", customer_context)
            else:
                # Parse the JSON string retrieved from database
                try:
                    customer_context = json.loads(customer_context_str)
                except json.JSONDecodeError:
                    # If parsing fails, treat as plain string
                    customer_context = {"raw_context": customer_context_str}
                
                # Also log when existing context is retrieved
                if customer_domain is None:
                    customer_domain = await customer_repo.get_customer_company_domain(customer_uid)
                save_company_context_log(customer_uid, customer_domain, customer_context)
                
    except Exception as e:
        error_msg = f"Error retrieving customer_context: {type(e).__name__}: {str(e)}"
        logging.error(error_msg)
        customer_context = None

    # Check threshold
    try:
        with run(name="ThresholdCheck", run_type="tool", metadata={"step": "threshold_evaluation"}):
            # Handle both string and boolean values for actionable_and_useful
            actionable_value = first_layer_response.actionable_and_useful
            if isinstance(actionable_value, bool):
                is_actionable = actionable_value
            elif isinstance(actionable_value, str):
                is_actionable = actionable_value.lower() == 'true'
            else:
                is_actionable = False
                
            usefulness_score = int(first_layer_response.update_usefulness_score) if first_layer_response.update_usefulness_score is not None else 0
            
    except (AttributeError, ValueError, TypeError) as e:
        error_msg = f"Error parsing threshold values: {e}"
        logging.error(error_msg)
        is_actionable = False
        usefulness_score = 0

    threshold_data = f"Actionable: {is_actionable}, Usefulness Score: {usefulness_score}"
    
    # DEBUG: Print threshold evaluation
    print(f"DEBUG - Threshold Check:")
    print(f"  - is_actionable: {is_actionable} (type: {type(is_actionable)})")
    print(f"  - usefulness_score: {usefulness_score} (type: {type(usefulness_score)})")
    print(f"  - threshold_met: {is_actionable and usefulness_score > 70}")
    logging.info(f"Threshold evaluation - Actionable: {is_actionable}, Score: {usefulness_score}, Met: {is_actionable and usefulness_score > 70}")

    if is_actionable and usefulness_score > 70:
        # Log when threshold check is positive and agents will be triggered
        save_threshold_trigger_log(customer_uid, company, threshold_data, True)
        
        with run(name="SecondLayerProcessing", run_type="chain", metadata={"step": "second_layer_analysis"}):
            second_layer_prompt = """
            You are a JSON analysis assistant. Analyze the company update and determine if an agent is needed.
            
            STRICT INSTRUCTIONS:
            1. ONLY return valid JSON - no markdown, no explanations, no code blocks
            2. Follow the exact format specified below
            3. Keep responses concise and direct
            
            Input Analysis:
            Company: {company}
            Company Context: {customer_context}
            Company Type: {company_type}
            Update Type: {update_type}
            Update Category: {update_category}
            Raw data/update: {text}
            Title: {title}
            Key Insights: {key_insights}
            Agent Catalogue: {agent_catalogue}
            
            Return ONLY this JSON format:
            {{
                "is_agent_useful": "true" or "false",
                "agent_name": "exact agent name from catalogue or empty string",
                "agent_input": "specific input for the agent or empty string"
            }}
            """
            
            AGENT_CATALOGUE = """
            "Similar Client Discovery Agent": "This agent takes a company name, domain, or a brief description as input and finds similar companies using Perplexity. It returns a list of similar companies along with their domains for further lead discovery or sales prospecting. input: company domain (or) name + description. Only when to use: when the company's update is about onboarding a new customer or client."
            "Content Marketing Agent": "This agent takes a piece of content (blog, post, tweet, text) as input and creates a better and plagiarism free content of same type. It also suggests trending topics for consideration. input: content. Only when to use: when the company's update is about content marketing, blog posts, or social media updates."
            """

            second_layer_input = {
                "company": company,
                "customer_context": format_customer_context_for_prompt(customer_context),
                "company_type": company_type,
                "update_type": first_layer_response.update_type,
                "update_category": first_layer_response.update_category,
                "text": text,
                "title": first_layer_response.title,
                "key_insights": first_layer_response.description,
                "agent_catalogue": AGENT_CATALOGUE
            }

            second_layer_template = PromptTemplate(
                template=second_layer_prompt,
                input_variables=[
                    "company",
                    "customer_context",
                    "company_type",
                    "update_type",
                    "update_category",
                    "text",
                    "title",
                    "key_insights",
                    "agent_catalogue"
                ],
                partial_variables={"format_instructions": JsonOutputParser().get_format_instructions()}
            )
            
            second_layer_chain = second_layer_template | llm | JsonOutputParser()
            
            try:
                print(f"DEBUG - Invoking second layer with input:")
                print(f"  - Company: {company}")
                print(f"  - Update Type: {first_layer_response.update_type}")
                print(f"  - Update Category: {first_layer_response.update_category}")
                
                second_layer_response = second_layer_chain.invoke(
                    second_layer_input,
                    config={
                        "metadata": {
                            "step": "second_layer",
                            "company": company,
                            "customer_uid": customer_uid
                        }
                    }
                )
                
                print(f"DEBUG - Raw second layer response: {second_layer_response}")
                print(f"DEBUG - Second layer response type: {type(second_layer_response)}")
                
                # Handle cases where LLM returns text instead of JSON
                second_layer_response = clean_json_response(
                    second_layer_response, 
                    ["is_agent_useful", "agent_name", "agent_input"]
                )
                
                print(f"DEBUG - Cleaned second layer response: {second_layer_response}")
                print(f"DEBUG - is_agent_useful value: '{second_layer_response.get('is_agent_useful', '')}' (lower: '{second_layer_response.get('is_agent_useful', '').lower()}')")
                
                if second_layer_response.get("is_agent_useful", "").lower() == 'true':
                    print(f"DEBUG - Agent deemed useful! Proceeding with agent processing...")
                    with run(name="AgentProcessing", run_type="chain", metadata={"step": "agent_layer"}):
                        agent_name = second_layer_response.get("agent_name", "")
                        agent_input = second_layer_response.get("agent_input", "")
                        
                        # Append raw text data to agent input
                        if agent_input and text:
                            full_agent_input = f"{agent_input}\n\nRaw data/update:\n{text}"
                        elif text:
                            full_agent_input = f"Raw data/update:\n{text}"
                        else:
                            full_agent_input = agent_input
                        
                        print(f"DEBUG - Agent details:")
                        print(f"  - Agent Name: '{agent_name}'")
                        print(f"  - Agent Input: '{agent_input}'")
                        print(f"  - Full Agent Input: '{full_agent_input[:200]}...' (truncated)")
                        print(f"  - Full Agent Input Length: {len(full_agent_input) if full_agent_input else 0}")
                        
                        if not agent_name:
                            print(f"ERROR - No agent name provided!")
                            logging.error("No agent name provided in second layer response")
                            return first_layer_response
                        
                        if not agent_input and not text:
                            print(f"WARNING - No agent input or raw text provided!")
                            logging.warning("No agent input or raw text provided in second layer response")
                        
                        try:
                            print(f"DEBUG - Calling agent API: {agent_name}")
                            # Make actual API call to the agent with full input including raw data
                            agent_api_response = await call_agent_api(agent_name, full_agent_input)
                            
                            print(f"DEBUG - Agent API response: {agent_api_response}")
                            
                            if agent_api_response["success"]:
                                print(f"DEBUG - Agent API call successful!")
                                agent_layer_response = {
                                    "agent_output": agent_api_response["agent_output"]
                                }
                                # Log successful agent output
                                save_agent_output_log(customer_uid, company, agent_name, agent_api_response["agent_output"], True)
                                
                            else:
                                print(f"DEBUG - Agent API call failed: {agent_api_response.get('error', 'Unknown error')}")
                                # Handle agent API failure
                                agent_layer_response = {
                                    "agent_output": f"Agent API call failed: {agent_api_response.get('error', 'Unknown error')}"
                                }
                                # Log failed agent output
                                save_agent_output_log(customer_uid, company, agent_name, agent_layer_response["agent_output"], False)
                                
                        except Exception as e:
                            error_msg = f"Error calling agent API: {e}"
                            print(f"DEBUG - Exception calling agent API: {error_msg}")
                            logging.error(error_msg)
                            agent_layer_response = {
                                "agent_output": f"Error calling agent: {str(e)}"
                            }
                            # Log error agent output
                            save_agent_output_log(customer_uid, company, agent_name, agent_layer_response["agent_output"], False)
                        
                        # Final Layer - Process the agent output regardless of success/failure
                        with run(name="FinalLayerProcessing", run_type="chain", metadata={"step": "final_layer"}):
                            final_layer_prompt = """
                            You are a business insights assistant. Generate a clear, actionable business recommendation.
                            
                            STRICT INSTRUCTIONS:
                            1. ONLY return valid JSON - no markdown, no explanations, no code blocks
                            2. Keep the action_point concise and specific
                            3. Focus on practical next steps
                            
                            Context:
                            Company: {company} ({company_type})
                            Update: {update_category} - {update_type}
                            Agent Used: {agent_name}
                            Agent Output: {agent_output}
                            Your Company Context: {customer_context}

                            Return ONLY this JSON format:
                            {{
                                "action_point": "A clear, specific recommendation with actionable next steps."
                            }}
                            """
                            
                            final_layer_template = PromptTemplate(
                                template=final_layer_prompt,
                                input_variables=["company", "company_type", "update_category", "update_type", "customer_context", "agent_name", "agent_output"],
                                partial_variables={"format_instructions": JsonOutputParser().get_format_instructions()}
                            )
                            
                            final_layer_chain = final_layer_template | llm | JsonOutputParser()
                            
                            try:
                                final_layer_response = final_layer_chain.invoke(
                                    {
                                        "company": company,
                                        "company_type": company_type,
                                        "update_category": first_layer_response.update_category,
                                        "update_type": first_layer_response.update_type,
                                        "customer_context": format_customer_context_for_prompt(customer_context),
                                        "agent_name": agent_name,
                                        "agent_output": agent_layer_response.get("agent_output", "")
                                    },
                                    config={
                                        "metadata": {
                                            "step": "final_layer",
                                            "company": company,
                                            "customer_uid": customer_uid,
                                            "agent_name": agent_name
                                        }
                                    }
                                )
                                
                                # Handle cases where final_layer_response is not a proper dict or string
                                final_layer_response = clean_json_response(
                                    final_layer_response,
                                    ["action_point"]
                                )
                                
                                action_point = final_layer_response.get("action_point", "Agent processed but no specific action point generated")
                                
                                # Ensure action_point is a string
                                if not isinstance(action_point, str):
                                    action_point = str(action_point) if action_point else "Agent processed but no specific action point generated"
                                
                                return LLMTrackedCompanyUpdate(
                                    title=first_layer_response.title,
                                    description=first_layer_response.description,
                                    update_category=first_layer_response.update_category,
                                    update_type=first_layer_response.update_type,
                                    actionable_and_useful=first_layer_response.actionable_and_useful,
                                    update_usefulness_score=first_layer_response.update_usefulness_score,
                                    action_point=action_point
                                )
                            except Exception as e:
                                error_msg = f"Error invoking final layer chain: {e}"
                                logging.error(error_msg)
                                return first_layer_response
                else:
                    print(f"DEBUG - Agent not deemed useful. Second layer response: {second_layer_response}")
                    print(f"DEBUG - is_agent_useful value was: '{second_layer_response.get('is_agent_useful', 'MISSING')}'")
                    return first_layer_response
            except Exception as e:
                error_msg = f"Error invoking second layer chain: {e}"
                print(f"DEBUG - Exception in second layer: {error_msg}")
                logging.error(error_msg)
                return first_layer_response
    else:
        # Log when threshold check is negative
        print(f"DEBUG - Threshold not met, skipping agent processing")
        save_threshold_trigger_log(customer_uid, company, threshold_data, False)

    
    return first_layer_response