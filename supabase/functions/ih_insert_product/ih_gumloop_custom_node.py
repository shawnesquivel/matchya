def main(estimated_mrr, llm_mrr_analysis, company_research, profile_id, user_id, params):
    """
    Processes product analysis data and sends it to the ih-insert-product edge function.
    
    Args:
        company_research (dict): The company research data with required fields:
            - product_name (str)
            - landing_page_link (str)
            - description (str)
            - total_user_count (int/str)
            - has_freemium (bool/str)
            - monthly_subscription_price (float/str)
            - annual_subscription_price (float/str)
            - industry (list/str)
            - llm_product_summary (str)
        estimated_mrr (float): Estimated Monthly Recurring Revenue
        llm_mrr_analysis (str): AI analysis of MRR calculation
        profile_id (str): UUID of the profile
        user_id (str): User ID from the profile
        
    Returns:
        str: JSON response from the edge function
    """
    import requests
    import json
    
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
    log("=== Starting Processing ===")
    log(f"Input Types - company_research: {type(company_research)}, estimated_mrr: {type(estimated_mrr)}, llm_mrr_analysis: {type(llm_mrr_analysis)}")
    log(f"Profile Info - profile_id: {profile_id}, user_id: {user_id}")
    
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
        
    # Process estimated_mrr
    estimated_mrr = parse_mrr(estimated_mrr)
    log(f"Processed estimated_mrr: {estimated_mrr}")

    EDGE_FUNCTION_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/ih_insert_product"
    PRODUCTION_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PRODUCTION_ANON_KEY}"
    }

    try:
        log("STEP 1: Validating and processing input data")
        
        # Update required parameters check - estimated_mrr can be null
        if not company_research or not profile_id or not user_id:
            missing = []
            if not company_research: missing.append("company_research")
            if not profile_id: missing.append("profile_id")
            if not user_id: missing.append("user_id")
            
            return json.dumps({
                "success": False,
                "error": "Missing required parameters",
                "message": f"Missing required parameters: {', '.join(missing)}",
                "logs": logs
            })

        # Check if company_research is a dictionary
        if not isinstance(company_research, dict):
            # Try to parse if it's a JSON string
            if isinstance(company_research, str):
                try:
                    company_research = json.loads(company_research)
                    log("Successfully parsed company_research from JSON string to dictionary")
                except json.JSONDecodeError as e:
                    log(f"Failed to parse company_research JSON: {str(e)}")
                    log(f"Raw company_research: {company_research[:200]}...")  # Log first 200 chars
                    return json.dumps({
                        "success": False,
                        "error": "Invalid JSON string",
                        "message": f"company_research is a string but not valid JSON: {str(e)}",
                        "logs": logs
                    })
            else:
                return json.dumps({
                    "success": False,
                    "error": "Invalid parameter type",
                    "message": f"company_research must be a dictionary or JSON string, got {type(company_research)}",
                    "logs": logs
                })

        # Log company_research structure
        log(f"company_research keys: {list(company_research.keys())}")

        # Required fields in company_research
        required_fields = [
            "product_name",
            "landing_page_link",
            "description",
            "total_user_count",
            "has_freemium",
            "monthly_subscription_price",
            "annual_subscription_price",
            "industry",
            "llm_product_summary"
        ]

        missing_fields = [field for field in required_fields if field not in company_research]
        if missing_fields:
            return json.dumps({
                "success": False,
                "error": "Missing required fields",
                "message": f"Missing fields in company_research: {', '.join(missing_fields)}",
                "logs": logs
            })

        # Process industry field to ensure it's an array of valid types
        log(f"Processing industry field. Current value: {company_research.get('industry')}")
        
        # Handle string input - now with better comma handling
        if isinstance(company_research['industry'], str):
            # First try splitting by comma, if no commas found, try to match as is
            if ',' in company_research['industry']:
                industries = [ind.strip() for ind in company_research['industry'].split(',')]
            else:
                # Try to find industry boundaries by matching valid types
                raw_text = company_research['industry'].lower()
                industries = []
                for valid_type in VALID_INDUSTRIES:
                    if valid_type in raw_text:
                        industries.append(valid_type)
                
            company_research['industry'] = industries
            log(f"Processed industries: {industries}")
        
        # Validate industries against valid types
        if not isinstance(company_research['industry'], list):
            return json.dumps({
                "success": False,
                "error": "Invalid industry format",
                "message": f"Industry must be a string or list, got {type(company_research['industry'])}",
                "logs": logs
            })
        
        if not company_research['industry']:  # If no industries found
            return json.dumps({
                "success": False,
                "error": "No valid industries found",
                "message": f"Could not find any valid industries in: {company_research.get('industry')}. Valid types are: {', '.join(VALID_INDUSTRIES)}",
                "logs": logs
            })
        
        invalid_industries = [ind for ind in company_research['industry'] if ind not in VALID_INDUSTRIES]
        if invalid_industries:
            return json.dumps({
                "success": False,
                "error": "Invalid industry types",
                "message": f"Invalid industry types: {', '.join(invalid_industries)}. Valid types are: {', '.join(VALID_INDUSTRIES)}",
                "logs": logs
            })

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
                    return float(cleaned)
                except ValueError:
                    log(f"Could not parse price value: {price_value}")
                    return None
                    
            return None

        # Convert string values to appropriate types
        log("Converting string values to appropriate types")
        if isinstance(company_research['has_freemium'], str):
            company_research['has_freemium'] = company_research['has_freemium'].lower() == 'true'
            log(f"Converted has_freemium to boolean: {company_research['has_freemium']}")

        # Clean up price fields with new parser
        for price_field in ['monthly_subscription_price', 'annual_subscription_price']:
            original_value = company_research[price_field]
            company_research[price_field] = parse_price(original_value)
            log(f"Processed {price_field}: {original_value} -> {company_research[price_field]}")

        # Build the JSON payload - allow null MRR
        json_data = {
            "company_research": company_research,
            "estimated_mrr": estimated_mrr,  # Can be null now
            "llm_mrr_analysis": llm_mrr_analysis or "MRR analysis not available",
            "profile_id": profile_id,
            "user_id": user_id
        }
        log("Built final JSON payload")

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