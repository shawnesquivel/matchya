"""
Gumloop Custom Node - JSON Processor
Passes structured data to the Gumloop edge function

This version accepts individual parameters rather than a raw JSON string.
"""
def main(profile, profile_img_url, clinic_profile_url, fees, clinic_booking_url, licenses, params):
    """
    Processes structured input data and sends it to the Gumloop edge function.
    
    Args:
        profile (dict): The therapist profile data (required)
        profile_img_url (str): URL to the therapist's profile image (required)
        clinic_profile_url (str): URL to the therapist's clinic profile (required)
        fees (list, optional): List of fee structures (can be None)
        clinic_booking_url (str, optional): URL for booking appointments (can be None)
        licenses (list, optional): List of professional licenses (can be None)
        params (dict, optional): Additional parameters (can be None)
        
    Returns:
        str: JSON response from the edge function
    """
    import requests
    import json

    # Supabase edge function URL and anon key
    EDGE_FUNCTION_GUMLOOP_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/gumloop-v2"
    PRODUCTION_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + PRODUCTION_ANON_KEY
    }

    try:
        print("STEP 1: Building JSON payload from provided parameters")
        
        # Validate required parameters
        if not profile:
            print("ERROR: 'profile' parameter is required")
            return json.dumps({
                "success": False,
                "error": "Missing required parameter",
                "message": "The 'profile' parameter is required"
            })
            
        if not profile_img_url:
            print("WARNING: 'profile_img_url' parameter is missing")
            
        if not clinic_profile_url:
            print("ERROR: 'clinic_profile_url' parameter is required")
            return json.dumps({
                "success": False,
                "error": "Missing required parameter",
                "message": "The 'clinic_profile_url' parameter is required"
            })
        
        # Build the JSON payload
        json_data = {
            "profile": profile if isinstance(profile, str) else json.dumps(profile),
            "profile_img_url": profile_img_url,
            "clinic_profile_url": clinic_profile_url
        }
        
        # Add optional parameters if provided and not None
        if clinic_booking_url:
            json_data["clinic_booking_url"] = clinic_booking_url
            
        # Process fees if provided and not None
        if fees:
            print(f"STEP 2: Processing {len(fees)} fee items")
            string_fees = []
            for i, fee in enumerate(fees):
                if isinstance(fee, dict):
                    string_fees.append(json.dumps(fee))
                else:
                    string_fees.append(fee)
            json_data['fees'] = string_fees
            print(f"STEP 2.1: Processed all fees, now have {len(string_fees)} fee strings")
        
        # Process licenses if provided and not None
        if licenses:
            print(f"STEP 3: Processing {len(licenses)} license items")
            string_licenses = []
            for i, license in enumerate(licenses):
                if isinstance(license, dict):
                    # Ensure each license has a state field, default to BC if missing
                    if 'state' not in license or not license['state']:
                        print(f"STEP 3.1.{i}: Adding default state 'BC' to license: {license}")
                        license['state'] = 'BC'
                    string_licenses.append(json.dumps(license))
                else:
                    # For string licenses, we pass them as-is
                    string_licenses.append(license)
            json_data['licenses'] = string_licenses
            print(f"STEP 3.2: Processed all licenses, now have {len(string_licenses)} license strings")
        
        print("STEP 4: Making POST request to edge function")
        print(f"STEP 4.1: Using URL: {EDGE_FUNCTION_GUMLOOP_URL}")
        print(f"STEP 4.2: Sending data with profile type: {type(json_data['profile'])}")
        
        # Make POST request to edge function with JSON data
        response = requests.post(
            EDGE_FUNCTION_GUMLOOP_URL, 
            headers=headers, 
            json=json_data  # Use json parameter to automatically handle JSON serialization
        )
        
        print(f"STEP 5: Received response with status code: {response.status_code}")
        
        if response.status_code >= 400:
            print(f"STEP 5.1: Error response body: {response.text[:200]}")
            try:
                # Try to parse the error details from the response body
                error_data = response.json()
                return json.dumps({
                    "success": False,
                    "error": "Server error",
                    "status_code": response.status_code,
                    "details": error_data
                })
            except:
                # If can't parse JSON, return the raw error text
                return json.dumps({
                    "success": False,
                    "error": "Server error",
                    "status_code": response.status_code,
                    "message": response.text[:500]
                })
        
        # Raise exception for bad status codes
        response.raise_for_status()

        # Return the response as a string
        print("STEP 6: Successfully processed request")
        return response.text

    except requests.exceptions.RequestException as e:
        print(f"ERROR: Request error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Request error",
            "message": str(e)
        })
    except Exception as e:
        print(f"ERROR: Unexpected error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Unexpected error",
            "message": str(e)
        })

# Example usage:
if __name__ == "__main__":
    # Example profile data
    test_profile = {
        "first_name": "Test2Licenses",
        "middle_name": None,
        "last_name": "Langen",
        "pronouns": "she/her",
        "gender": "female",
        "sexuality": "prefer_not_to_say",
        "ethnicity": "white",
        "faith": "prefer_not_to_say",
        "bio": "Hi! My name is Laura and I am an RCC at Peak.",
        "clinic_name": "Peak Resilience Counselling",
        "clinic_street": "Unit 601-808 Nelson St.",
        "clinic_city": "Vancouver",
        "clinic_postal_code": "V6Z 2H2",
        "clinic_province": "BC",
        "clinic_country": "CA",
        "availability": "both",
        "is_accepting_clients": True,
        "education": [
          "Bachelor of Science at UBC in biopsychology, Master of Counselling degree from City University of Canada"
        ],
        "certifications": [
          "Registered Clinical Counsellor #20828, Registered with CVAP as a counsellor"
        ],
        "approaches": ["CBT", "EMDR"],
        "areas_of_focus": ["Anxiety", "Depression", "Trauma"],
        "languages": ["English"]
    }
    
    # Example fees data
    test_fees = [
        {
          "session_type": "individual",
          "duration_minutes": 50,
          "delivery_method": "virtual",
          "price": 150,
          "currency": "CAD",
          "session_category": "initial"
        },
        {
          "session_type": "individual",
          "duration_minutes": 50,
          "delivery_method": "in_person",
          "price": 175,
          "currency": "CAD",
          "session_category": "subsequent"
        }
    ]
    
    # Example licenses data
    test_licenses = [
        {
          "license_number": "999999999",
          "title": "RCC",
          "state": "BC",
          "issuing_body": "BCACC",
          "expiry_date": None
        }
    ]
    
    # Test call with optional parameters passing None
    # result = main(
    #     profile=test_profile,
    #     profile_img_url="https://example.com/profile.jpg",
    #     clinic_profile_url="https://example.com/clinic",
    #     fees=None,                  # Optional parameter passed as None
    #     clinic_booking_url=None,    # Optional parameter passed as None
    #     licenses=None,              # Optional parameter passed as None
    #     params=None                 # Optional parameter passed as None
    # )
    
    # Test call with all parameters
    # result = main(
    #     profile=test_profile,
    #     profile_img_url="https://example.com/profile.jpg",
    #     clinic_profile_url="https://example.com/clinic",
    #     fees=test_fees,
    #     clinic_booking_url="https://example.com/booking",
    #     licenses=test_licenses,
    #     params={}
    # )
    # print(result) 