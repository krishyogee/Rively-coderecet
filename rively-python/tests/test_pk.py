import asyncio
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

def test_portkey_poem_generator():
    """Simple test to verify Portkey API is working by generating a poem"""
    
    # Configure Portkey headers - let Portkey manage model and provider
    portkey_headers = createHeaders(
        api_key= "CSlaoQ7bE2ABobFLRBPVuzWR5MmK"
    )
    
    # Initialize LLM with Portkey
    llm = ChatOpenAI(
        api_key="dummy-key-portkey-handles-routing",  # Dummy key since Portkey handles routing
        base_url=PORTKEY_GATEWAY_URL,
        default_headers=portkey_headers,
        temperature=0.8  # Higher temperature for more creative poems
    )
    
    # Create a simple prompt template for poem generation
    poem_prompt = PromptTemplate(
        template="""Write a short, beautiful poem about a person named {name}. 
        Make it creative, positive, and meaningful. The poem should be 4-6 lines long.""",
        input_variables=["name"]
    )
    
    # Create the chain
    output_parser = StrOutputParser()
    chain = poem_prompt | llm | output_parser
    
    # Get name input from user
    name = input("Enter a name for the poem: ").strip()
    
    if not name:
        print("No name provided. Using 'Alex' as default.")
        name = "Alex"
    
    try:
        print(f"\nGenerating a poem for {name}...")
        print("-" * 40)
        
        # Invoke the chain
        response = chain.invoke({"name": name})
        
        print(f"\nPoem for {name}:")
        print("=" * 30)
        print(response)
        print("=" * 30)
        print("\n✅ Portkey API is working successfully!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error testing Portkey API: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Portkey API with Poem Generator")
    print("=" * 50)
    
    success = test_portkey_poem_generator()
    
    if success:
        print("\n🎉 Test completed successfully!")
    else:
        print("\n💥 Test failed. Please check your Portkey configuration.")