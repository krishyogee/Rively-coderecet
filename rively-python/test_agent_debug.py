#!/usr/bin/env python3
"""
Test script to debug agent triggering issues
"""
import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.services.llm_update_generator import convert_data_into_updates_llm
from app.repository.customers import CustomerRepository

async def test_agent_triggering():
    """Test the agent triggering functionality with debug output."""
    
    print("Starting agent triggering test...")
    
    # Mock customer repository - you might need to adjust this based on your actual implementation
    class MockCustomerRepo:
        async def get_customer_context(self, customer_uid):
            # Return None to trigger context extraction
            return None
            
        async def get_customer_company_domain(self, customer_uid):
            return "example.com"
            
        async def update_customer_with_customer_context(self, customer_uid, context_update):
            print(f"Mock: Updated customer {customer_uid} with context")
            return True
    
    customer_repo = MockCustomerRepo()
    
    # Test data that should trigger agents
    test_cases = [
        {
            "text": "We are excited to announce that we have onboarded a new major client, TechCorp Inc., as our strategic partner. They will be using our SaaS platform for their operations.",
            "source_type": "company_update",
            "company_type": "SaaS",
            "company": "TestCompany",
            "tracked_company_uid": "test-123",
            "customer_uid": "customer-456"
        },
        {
            "text": "Our marketing team has published a new blog post about the benefits of cloud computing and digital transformation strategies for modern businesses.",
            "source_type": "content",
            "company_type": "Technology",
            "company": "TestCompany2",
            "tracked_company_uid": "test-456",
            "customer_uid": "customer-789"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST CASE {i}")
        print(f"{'='*60}")
        print(f"Text: {test_case['text'][:100]}...")
        print(f"Company: {test_case['company']}")
        print(f"Type: {test_case['company_type']}")
        
        try:
            result = await convert_data_into_updates_llm(
                text=test_case["text"],
                source_type=test_case["source_type"],
                company_type=test_case["company_type"],
                company=test_case["company"],
                tracked_company_uid=test_case["tracked_company_uid"],
                customer_repo=customer_repo,
                customer_uid=test_case["customer_uid"]
            )
            
            print(f"\nFINAL RESULT:")
            print(f"  - Title: {result.title}")
            print(f"  - Description: {result.description[:100]}...")
            print(f"  - Update Type: {result.update_type}")
            print(f"  - Update Category: {result.update_category}")
            print(f"  - Actionable: {result.actionable_and_useful}")
            print(f"  - Usefulness Score: {result.update_usefulness_score}")
            print(f"  - Action Point: {result.action_point}")
            
        except Exception as e:
            print(f"ERROR in test case {i}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_agent_triggering())
