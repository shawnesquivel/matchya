#!/usr/bin/env python3
"""
Test script for the Gumloop custom node.
This script runs the main function from ih_gumloop_custom_node.py with test data
to verify it works correctly with the expected JSON payload format.
"""

import json
import sys
import os
from importlib.machinery import SourceFileLoader

# Define the test payload that matches the format in the requirements
TEST_PAYLOAD = {
    "profile": "{\"x_link\": \"https://x.com/jackfriks\", \"first_name\": \"Jack\", \"last_name\": \"Friks\", \"llm_founder_summary\": \"Jack Friks is an indie maker who recently achieved a milestone of $10K in monthly recurring revenue (MRR) across his products. His flagship tool, Post Bridge, simplifies social media scheduling for creators and small teams with its affordability and ease of use. Jack's journey reflects perseverance; after four years of failed attempts, he successfully launched multiple products, including Curiosity Quench\\u2014a productivity app promoting mindful screen time and personal growth with over 50K downloads. Jack's story resonates with the indie hacking community as a testament to persistence and innovation. By solving his own challenges as a creator, he built tools that now empower thousands of others worldwide.\", \"total_estimated_mrr\": \"10000\"}",
    "products": "{\"product_name\": \"Post Bridge\", \"total_user_count\": \"2500\", \"has_freemium\": \"True\", \"monthly_subscription_price\": \"10.75\", \"annual_subscription_price\": \"$129 (equivalent to $10.75/month)\", \"estimated_mrr\": \"10000\", \"llm_mrr_analysis\": \"The founder explicitly stated that the total MRR across all products is $10K/month. Since Post Bridge is a significant contributor, its MRR is assumed to align with this figure.\"},{\"product_name\": \"Curiosity Quench\", \"total_user_count\": \"50000\", \"has_freemium\": \"True\", \"monthly_subscription_price\": \"\", \"annual_subscription_price\": \"null (pricing not disclosed)\", \"estimated_mrr\": \"\", \"llm_mrr_analysis\": \"Specific pricing details are unavailable for Curiosity Quench. While the app has over 50,000 downloads, the lack of monetization data prevents an accurate MRR calculation.\"}",
    "industries": "b2b_enterprise,consumer,health_wellness,education_edtech"
}

# Sample perplexity research markdown
TEST_PERPLEXITY = """# Research on Jack Friks and his Products

## Overview
Jack Friks is an independent software developer who has created multiple successful products, most notably Post Bridge and Curiosity Quench. He recently reached $10,000 in monthly recurring revenue (MRR) across his product portfolio.

## Post Bridge
Post Bridge is a social media scheduling tool designed for creators and small teams. Key features include:
- Affordable pricing at $10.75/month or $129/year
- Simple, intuitive interface
- Approximately 2,500 users
- Primary revenue driver for Jack's business

## Curiosity Quench
Curiosity Quench is a productivity app focused on mindful screen time and personal growth. Notable aspects:
- Over 50,000 downloads
- Freemium model, but specific pricing not disclosed
- Focuses on reducing digital distraction

## Jack's Entrepreneurial Journey
- Experienced 4 years of failed attempts before finding success
- Built tools to solve his own challenges as a content creator
- His perseverance story resonates strongly with the indie hacking community
"""

def main():
    """Run the test for the Gumloop custom node."""
    print("Starting Gumloop custom node test...")
    
    # Load the module
    try:
        node_path = os.path.join(os.path.dirname(__file__), "ih_gumloop_custom_node.py")
        if not os.path.exists(node_path):
            print(f"Error: Could not find {node_path}")
            sys.exit(1)
            
        module = SourceFileLoader("ih_gumloop_custom_node", node_path).load_module()
        
        # Call the main function with our test payload and perplexity research
        result = module.main(TEST_PAYLOAD, TEST_PERPLEXITY, {})
        
        # Parse the result as JSON
        try:
            result_json = json.loads(result)
            print("\nRESULT:")
            print(json.dumps(result_json, indent=2))
            
            # Check for success
            if result_json.get("success") is True:
                print("\n✅ Test passed!")
            else:
                print("\n❌ Test failed!")
                if "error" in result_json:
                    print(f"Error: {result_json['error']}")
                if "message" in result_json:
                    print(f"Message: {result_json['message']}")
                if "logs" in result_json:
                    print("\nLogs:")
                    for log in result_json["logs"]:
                        print(f"  {log}")
        except json.JSONDecodeError:
            print("Error: Could not parse result as JSON:")
            print(result)
            
    except Exception as e:
        print(f"Error running test: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 