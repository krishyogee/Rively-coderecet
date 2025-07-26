from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.config import settings
from app.schemas.company_updates import LLMTrackedCompanyUpdate


def convert_data_into_updates_llm(text: str, source_type: str, type: str, company: str) -> LLMTrackedCompanyUpdate:
    
    with open("app/services/prompts/update_generator_prompt.txt", "r") as file:
        base_prompt = file.read()

    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=settings.GROQ_API_KEY, temperature=0.7)
    
    # Set up JsonOutputParser with the Pydantic model
    output_parser = JsonOutputParser(pydantic_object=LLMTrackedCompanyUpdate)
    
    # Create a prompt template with format instructions
    prompt_template = PromptTemplate(
        template=f"{base_prompt}\n{{format_instructions}}\n",
        input_variables=["text", "source-type", "company-type", "company"],
        partial_variables={"format_instructions": output_parser.get_format_instructions()},
    )           
    
    chain = prompt_template | llm | output_parser

    prompt_input = {
        "text": text,
        "source-type": source_type,
        "company-type": type,
        "company": company
        }

    response = chain.invoke(prompt_input)
        
    if not isinstance(response, LLMTrackedCompanyUpdate):
            return LLMTrackedCompanyUpdate(
                title=response.get("title", ""),
                description=response.get("description", ""),
                update_type=response.get("update_type", ""),
                update_category=response.get("update_category", ""),
                actionable_and_useful=response.get("actionable_and_useful", "")
                update_usefulness_score=response.get("update_usefulness_score", "")
                )

    return response


    