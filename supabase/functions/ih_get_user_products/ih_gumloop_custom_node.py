def main(user_id, params):
    """
    Fetches profile id and raw_product_links for a given user_id from the ih.profiles table.
    
    Args:
        user_id (str): The user_id to fetch products for
        
    Returns:
        tuple: (profile_id, raw_product_links) where profile_id is UUID and raw_product_links is a comma-separated string
    """
    import requests
    
    # Initialize logging
    logs = []
    def log(message):
        logs.append(message)
        print(message)  # Still print for local debugging

    # Initialize return values
    profile_id = None
    product_links = ""

    # Log initial state
    log("=== Starting Processing ===")
    log(f"Input - user_id: {user_id}")
    
    EDGE_FUNCTION_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/ih_get_user_products"
    PRODUCTION_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PRODUCTION_ANON_KEY}"
    }

    try:
        log("STEP 1: Validating input")
        
        # Validate required parameters
        if not user_id:
            log("Error: Missing user_id")
            return profile_id, product_links

        # Build the JSON payload
        json_data = {
            "user_id": user_id
        }
        log("Built JSON payload")

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
            return profile_id, product_links
        
        response.raise_for_status()
        log("STEP 4: Successfully processed request")
        
        # Parse the response and extract data
        try:
            response_data = response.json()
            if response_data.get('success') and response_data.get('data'):
                data = response_data['data']
                profile_id = data.get('id')
                product_links = data.get('raw_product_links', '')
                log(f"Successfully extracted profile_id: {profile_id}")
                log(f"Successfully extracted product_links: {product_links}")
            else:
                log("No data found in response")
        except Exception as e:
            log(f"Error parsing response: {str(e)}")

    except requests.exceptions.RequestException as e:
        log(f"ERROR: Request error: {str(e)}")
    except Exception as e:
        log(f"ERROR: Unexpected error: {str(e)}")

    return profile_id, product_links