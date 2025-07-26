#!/usr/bin/env python3
"""
Test script to verify logging functions work correctly
"""
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.llm_update_generator import (
    save_company_context_log,
    save_threshold_trigger_log,
    save_agent_output_log
)

def test_logging_functions():
    """Test all logging functions"""
    
    print("Testing logging functions...")
    
    # Test company context logging
    print("1. Testing company context logging...")
    context_data = {
        "company_name": "Test Company",
        "industry": "Technology",
        "description": "A test company for logging verification"
    }
    save_company_context_log("test_customer_001", "testcompany.com", context_data)
    
    # Test threshold trigger logging
    print("2. Testing threshold trigger logging...")
    save_threshold_trigger_log("test_customer_001", "Test Company", "Actionable: True, Usefulness Score: 85", True)
    save_threshold_trigger_log("test_customer_002", "Another Company", "Actionable: False, Usefulness Score: 45", False)
    
    # Test agent output logging
    print("3. Testing agent output logging...")
    save_agent_output_log("test_customer_001", "Test Company", "Content Marketing Agent", 
                         "This is a successful agent response with marketing insights.", True)
    save_agent_output_log("test_customer_002", "Another Company", "Similar Client Discovery Agent", 
                         "Error: API timeout occurred", False)
    
    print("\nLogging tests completed! Check the following files in app/logs/:")
    print("- customer_context_test_customer_001.txt")
    print("- threshold_triggers.txt")
    print("- agent_outputs.txt")

if __name__ == "__main__":
    test_logging_functions()
