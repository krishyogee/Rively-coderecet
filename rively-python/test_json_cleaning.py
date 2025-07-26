#!/usr/bin/env python3
"""
Test script to verify JSON cleaning functions work correctly
"""
import sys
import os
import re
import json

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def clean_json_response(response_text: str, expected_keys: list = None) -> dict:
    """Clean and extract JSON from LLM response text."""
    try:
        # If it's already a dict, return it
        if isinstance(response_text, dict):
            return response_text
            
        # If it's a string, try to extract JSON
        if isinstance(response_text, str):
            # Remove markdown code blocks
            cleaned = re.sub(r'```json\s*|\s*```|```', '', response_text)
            cleaned = re.sub(r'^\s*[\w\s]*?\{', '{', cleaned, flags=re.MULTILINE)
            
            # Try to find JSON object
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', cleaned)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                return parsed
                
        # Fallback: return empty dict with expected keys
        if expected_keys:
            return {key: "" for key in expected_keys}
        return {}
        
    except Exception as e:
        print(f"Failed to clean JSON response: {e}")
        if expected_keys:
            return {key: "" for key in expected_keys}
        return {}

def test_json_cleaning():
    """Test JSON cleaning with various malformed inputs"""
    
    # Test case 1: Valid JSON dict
    test1 = {"is_agent_useful": "true", "agent_name": "Test"}
    result1 = clean_json_response(test1, ["is_agent_useful", "agent_name"])
    print(f"Test 1 - Valid dict: {result1}")
    
    # Test case 2: Markdown wrapped JSON
    test2 = '''```json
    {
        "is_agent_useful": "true",
        "agent_name": "Content Marketing Agent",
        "agent_prompt": "Create better content"
    }
    ```'''
    result2 = clean_json_response(test2, ["is_agent_useful", "agent_name", "agent_prompt"])
    print(f"Test 2 - Markdown JSON: {result2}")
    
    # Test case 3: JSON with extra text (like the error you showed)
    test3 = '''**Step 1: Analysis**
    
    Based on the input, we can determine...
    
    {
        "is_agent_useful": "true",
        "agent_name": "Similar Client Discovery Agent",
        "agent_prompt": "Find similar companies to Attio"
    }
    
    **Additional notes**'''
    result3 = clean_json_response(test3, ["is_agent_useful", "agent_name", "agent_prompt"])
    print(f"Test 3 - JSON with extra text: {result3}")
    
    # Test case 4: Completely malformed
    test4 = "This is not JSON at all"
    result4 = clean_json_response(test4, ["is_agent_useful", "agent_name"])
    print(f"Test 4 - No JSON: {result4}")
    
    # Test case 5: Nested action_point dict issue
    test5 = {
        "action_point": {
            "title": "Some title",
            "action_point": "The actual action"
        }
    }
    # Simulate the nested case handling
    action_point = test5.get("action_point", "fallback")
    if isinstance(action_point, dict):
        action_point = str(action_point) if action_point else "fallback"
    print(f"Test 5 - Nested action_point: {action_point}")

if __name__ == "__main__":
    test_json_cleaning()
