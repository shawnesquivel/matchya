def main(json_payload, perplexity_research, params):
    """
    Processes JSON payload containing profile and products data and sends it to the ih_insert_profile edge function.
    
    Args:
        json_payload (dict): The JSON payload with required fields:
            - profile (str): JSON string containing profile data
            - products (str): JSON string containing product data
            - industries (str): Comma-separated list of industries
        perplexity_research (str): Markdown text from Perplexity research to be stored in profile
        params (dict): Additional parameters (unused)
        
    Returns:
        str: JSON response from the edge function
    """
    import requests
    import json
    import re
    
    # Initialize logging
    logs = []
    def log(message):
        logs.append(message)
        print(message)  # Still print for local debugging

    # Valid industry types based on the enum
    VALID_INDUSTRIES = [
        'agriculture_agtech',
        'artificial_intelligence',
        'ar_vr',
        'b2b_enterprise',
        'biomedical_biotech',
        'blockchain',
        'climate_sustainability',
        'consumer',
        'ecommerce',
        'developer_tools',
        'education_edtech',
        'energy',
        'entertainment',
        'financial_fintech',
        'food_beverage',
        'gaming',
        'government',
        'hardware',
        'hard_tech',
        'health_wellness',
        'healthcare',
        'marketplace',
        'non_profit'
    ]

    # Log initial state
    log("=== Gumloop Custom Node: Insert Indie Hacker Profile: START  ===")
    log(f"Input Type - json_payload: {type(json_payload)}")
    log(f"Input Type - perplexity_research: {type(perplexity_research)}")
    
    # More robust MRR handling
    def parse_mrr(mrr_value):
        if mrr_value is None:
            return None
            
        if isinstance(mrr_value, (int, float)):
            return float(mrr_value)
            
        if isinstance(mrr_value, str):
            # Remove common currency symbols and whitespace
            cleaned = mrr_value.replace('USD', '').replace('$', '').strip()
            
            # Handle common LLM responses indicating no MRR
            no_mrr_phrases = [
                'could not be calculated',
                'cannot be calculated',
                'not available',
                'unknown',
                'n/a',
                'null',
                'none'
            ]
            if any(phrase in cleaned.lower() for phrase in no_mrr_phrases):
                log(f"MRR could not be calculated from text: {mrr_value}")
                return None
                
            try:
                # Try to extract numeric value
                return float(cleaned)
            except ValueError:
                log(f"Could not parse MRR value: {mrr_value}")
                return None
                
        return None

    # Helper function for price parsing
    def parse_price(price_value):
        if price_value is None:
            return None
            
        if isinstance(price_value, (int, float)):
            return float(price_value)
            
        if isinstance(price_value, str):
            # Remove currency symbols and whitespace
            cleaned = price_value.replace('USD', '').replace('$', '').strip()
            
            # Handle common LLM responses indicating no price
            no_price_phrases = [
                'not mentioned',
                'not available',
                'no explicit',
                'unknown',
                'n/a',
                'null',
                'none'
            ]
            if any(phrase in cleaned.lower() for phrase in no_price_phrases):
                log(f"Price could not be determined from text: {price_value}")
                return None
                
            try:
                # Try to extract numeric value
                return float(cleaned)
            except ValueError:
                log(f"Could not parse price value: {price_value}")
                return None
                
        return None

    EDGE_FUNCTION_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/ih_insert_profile"
    PRODUCTION_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PRODUCTION_ANON_KEY}"
    }

    try:
        log("STEP 1: Validating and processing input data")
        
        # Validate required fields
        if not json_payload:
            return json.dumps({
                "success": False,
                "error": "Missing payload",
                "message": "JSON payload is required",
                "logs": logs
            })

        # Check if json_payload is a dictionary
        if not isinstance(json_payload, dict):
            # Try to parse if it's a JSON string
            if isinstance(json_payload, str):
                try:
                    json_payload = json.loads(json_payload)
                    log("Successfully parsed json_payload from JSON string to dictionary")
                except json.JSONDecodeError as e:
                    log(f"Failed to parse json_payload JSON: {str(e)}")
                    log(f"Raw json_payload: {json_payload[:200]}...")  # Log first 200 chars
                    return json.dumps({
                        "success": False,
                        "error": "Invalid JSON string",
                        "message": f"json_payload is a string but not valid JSON: {str(e)}",
                        "logs": logs
                    })
            else:
                return json.dumps({
                    "success": False,
                    "error": "Invalid parameter type",
                    "message": f"json_payload must be a dictionary or JSON string, got {type(json_payload)}",
                    "logs": logs
                })

        # Log json_payload structure
        log(f"json_payload keys: {list(json_payload.keys())}")

        # Required fields in json_payload
        required_fields = ["profile", "products", "industries"]
        missing_fields = [field for field in required_fields if field not in json_payload]
        
        if missing_fields:
            return json.dumps({
                "success": False,
                "error": "Missing required fields",
                "message": f"Missing fields in json_payload: {', '.join(missing_fields)}",
                "logs": logs
            })

        # Process profile data
        log("Processing profile data")
        try:
            if isinstance(json_payload["profile"], str):
                profile_data = json.loads(json_payload["profile"])
                log("Successfully parsed profile string to JSON")
            else:
                profile_data = json_payload["profile"]
                
            # Check required profile fields
            required_profile_fields = ["first_name"]
            missing_profile_fields = [field for field in required_profile_fields if field not in profile_data]
            
            if missing_profile_fields:
                return json.dumps({
                    "success": False,
                    "error": "Missing required profile fields",
                    "message": f"Missing fields in profile data: {', '.join(missing_profile_fields)}",
                    "logs": logs
                })
                
            # Generate user_id from first_name + last_name
            first_name = profile_data.get("first_name", "").lower()
            last_name = profile_data.get("last_name", "").lower()
            
            if not first_name:
                return json.dumps({
                    "success": False,
                    "error": "Invalid profile data",
                    "message": "first_name cannot be empty",
                    "logs": logs
                })
                
            # Create user_id - handle case where last_name might be missing
            if last_name:
                user_id = f"{first_name}.{last_name}"
            else:
                user_id = first_name
                
            # Clean user_id: remove special characters and spaces
            user_id = re.sub(r'[^a-z0-9\.]', '', user_id)
            log(f"Generated user_id: {user_id}")
            
            # Add user_id to profile data
            profile_data["user_id"] = user_id
            
            # Parse total_estimated_mrr if present
            if "total_estimated_mrr" in profile_data:
                profile_data["total_estimated_mrr"] = parse_mrr(profile_data["total_estimated_mrr"])
                log(f"Parsed total_estimated_mrr: {profile_data['total_estimated_mrr']}")
            
            # Add perplexity_research to profile if available
            if perplexity_research:
                log("Adding perplexity_research to profile data")
                profile_data["perplexity_analysis"] = perplexity_research
                
        except json.JSONDecodeError as e:
            log(f"Failed to parse profile JSON: {str(e)}")
            return json.dumps({
                "success": False,
                "error": "Invalid profile JSON",
                "message": f"profile field is not valid JSON: {str(e)}",
                "logs": logs
            })
            
        # Process products data - This is tricky because it's in a non-standard format
        log("Processing products data")
        try:
            products_raw = json_payload["products"]
            
            # First, check if it's already a list
            if isinstance(products_raw, list):
                products_data = products_raw
                log("Products data is already a list")
            else:
                # Try to parse as JSON
                try:
                    # First try as a JSON array
                    products_data = json.loads(f"[{products_raw}]")
                    log("Successfully parsed products by wrapping in array brackets")
                except json.JSONDecodeError:
                    # It might be a non-standard format with multiple JSON objects concatenated
                    log("Products data is not standard JSON array, trying alternative methods")
                    
                    try:
                        # Try to fix common issues with concatenated objects
                        # 1. Add commas between objects if missing
                        fixed_json = products_raw.replace("}{", "},{")
                        # 2. Wrap in array brackets
                        fixed_json = f"[{fixed_json}]"
                        products_data = json.loads(fixed_json)
                        log("Successfully parsed products using concatenation fix")
                    except json.JSONDecodeError as e:
                        log(f"Still failed to parse with concatenation fix: {str(e)}")
                        
                        # Last resort: manual splitting and parsing
                        log("Trying manual object splitting")
                        products_data = []
                        
                        # This pattern helps identify JSON object boundaries even if malformed
                        import re
                        pattern = r'{[^{}]*"product_name"\s*:\s*"[^"]*"[^{}]*}'
                        matches = re.findall(pattern, products_raw)
                        
                        if matches:
                            for i, match in enumerate(matches):
                                try:
                                    product = json.loads(match)
                                    products_data.append(product)
                                    log(f"Successfully parsed product {i+1} using regex")
                                except json.JSONDecodeError as e:
                                    log(f"Failed to parse product {i+1} with regex: {str(e)}")
                        else:
                            log("No product objects found with regex pattern")
                            
                            # If all else fails, create a minimal product to avoid complete failure
                            if "product_name" in products_raw:
                                # Extract product name using regex
                                name_match = re.search(r'"product_name"\s*:\s*"([^"]*)"', products_raw)
                                if name_match:
                                    product_name = name_match.group(1)
                                    log(f"Extracted product name: {product_name}")
                                    
                                    # Create a minimal product
                                    products_data = [{
                                        "product_name": product_name,
                                        "landing_page_link": f"https://{product_name.lower().replace(' ', '-')}.example.com"
                                    }]
                                    log("Created minimal product from extracted name")
            
            # Validate each product
            valid_products = []
            for i, product in enumerate(products_data):
                # Required fields
                required_product_fields = ["product_name"]
                missing_product_fields = [field for field in required_product_fields if field not in product]
                
                if missing_product_fields:
                    log(f"Product {i+1} is missing required fields: {missing_product_fields}")
                    # Skip this product instead of failing completely
                    continue
                    
                # Parse numeric fields
                for field in ["monthly_subscription_price", "annual_subscription_price", "estimated_mrr"]:
                    if field in product:
                        product[field] = parse_price(product[field])
                        log(f"Parsed {field} for product {i+1}: {product[field]}")
                
                # Parse boolean fields
                if "has_freemium" in product and isinstance(product["has_freemium"], str):
                    product["has_freemium"] = product["has_freemium"].lower() == "true"
                    
                # Ensure product has landing_page_link, generate if missing
                if "landing_page_link" not in product or not product["landing_page_link"]:
                    product_name = product["product_name"].lower().replace(" ", "-")
                    product["landing_page_link"] = f"https://{product_name}.example.com"
                    log(f"Generated landing_page_link for product {i+1}: {product['landing_page_link']}")
                
                # Add valid product to the list
                valid_products.append(product)
            
            # Replace the original list with only valid products
            products_data = valid_products
            log(f"Final number of valid products: {len(products_data)}")
                    
        except Exception as e:
            log(f"Error processing products data: {str(e)}")
            return json.dumps({
                "success": False,
                "error": "Products data processing error",
                "message": str(e),
                "logs": logs
            })
        
        # Process industries
        log("Processing industries data")
        industries = []
        
        if isinstance(json_payload["industries"], list):
            industries = json_payload["industries"]
        elif isinstance(json_payload["industries"], str):
            industries = [ind.strip() for ind in json_payload["industries"].split(",")]
        
        # Validate industries
        valid_industries = [ind for ind in industries if ind in VALID_INDUSTRIES]
        
        if not valid_industries:
            log(f"No valid industries found in: {industries}")
            # Default to 'consumer' if no valid industries
            valid_industries = ["consumer"]
            log(f"Using default industry: consumer")
        
        # Build the final payload
        json_data = {
            "profile_data": profile_data,
            "products_data": products_data,
            "industries": valid_industries
        }
        
        log("STEP 2: Making POST request to edge function")
        log(f"Using URL: {EDGE_FUNCTION_URL}")
        
        response = requests.post(
            EDGE_FUNCTION_URL, 
            headers=headers, 
            json=json_data
        )
        
        log(f"STEP 3: Received response with status code: {response.status_code}")
        
        if response.status_code >= 400:
            error_text = response.text[:200]
            log(f"Error response body: {error_text}")
            try:
                error_data = response.json()
                return json.dumps({
                    "success": False,
                    "error": "Server error",
                    "status_code": response.status_code,
                    "details": error_data,
                    "logs": logs
                })
            except:
                return json.dumps({
                    "success": False,
                    "error": "Server error",
                    "status_code": response.status_code,
                    "message": response.text[:500],
                    "logs": logs
                })
        
        response.raise_for_status()
        log("STEP 4: Successfully processed request")
        
        # Parse the response and add our logs
        try:
            response_data = response.json()
            if isinstance(response_data, dict):
                response_data["logs"] = logs
                return json.dumps(response_data)
            else:
                return json.dumps({
                    "success": True,
                    "data": response_data,
                    "logs": logs
                })
        except:
            return json.dumps({
                "success": True,
                "data": response.text,
                "logs": logs
            })

    except requests.exceptions.RequestException as e:
        log(f"ERROR: Request error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Request error",
            "message": str(e),
            "logs": logs
        })
    except Exception as e:
        log(f"ERROR: Unexpected error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Unexpected error",
            "message": str(e),
            "logs": logs
        })

# For testing manually
if __name__ == "__main__":
    test_payload = {
        "profile": "{\"x_link\": \"https://x.com/jackfriks\", \"first_name\": \"Jack\", \"last_name\": \"Friks\", \"llm_founder_summary\": \"Jack Friks is an indie maker who recently achieved a milestone of $10K in monthly recurring revenue (MRR) across his products. His flagship tool, Post Bridge, simplifies social media scheduling for creators and small teams with its affordability and ease of use. Jack's journey reflects perseverance; after four years of failed attempts, he successfully launched multiple products, including Curiosity Quench\\u2014a productivity app promoting mindful screen time and personal growth with over 50K downloads. Jack's story resonates with the indie hacking community as a testament to persistence and innovation. By solving his own challenges as a creator, he built tools that now empower thousands of others worldwide.\", \"total_estimated_mrr\": \"10000\"}",
        "products": "{\"product_name\": \"Post Bridge\", \"total_user_count\": \"2500\", \"has_freemium\": \"True\", \"monthly_subscription_price\": \"10.75\", \"annual_subscription_price\": \"$129 (equivalent to $10.75/month)\", \"estimated_mrr\": \"10000\", \"llm_mrr_analysis\": \"The founder explicitly stated that the total MRR across all products is $10K/month. Since Post Bridge is a significant contributor, its MRR is assumed to align with this figure.\"},{\"product_name\": \"Curiosity Quench\", \"total_user_count\": \"50000\", \"has_freemium\": \"True\", \"monthly_subscription_price\": \"\", \"annual_subscription_price\": \"null (pricing not disclosed)\", \"estimated_mrr\": \"\", \"llm_mrr_analysis\": \"Specific pricing details are unavailable for Curiosity Quench. While the app has over 50,000 downloads, the lack of monetization data prevents an accurate MRR calculation.\"}",
        "industries": "b2b_enterprise,consumer,health_wellness,education_edtech"
    }
    
    test_perplexity = """# Research on Jack Friks and his Products

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
    
    result = main(test_payload, test_perplexity, {})
    print(result) 