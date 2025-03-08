"""
Gumloop Custom Node - Text Processor
Passes raw text to the Gumloop edge function

Never change the main block.
"""
def main(text, params):
    import requests
    import json

    # Supabase edge function URL and anon key
    EDGE_FUNCTION_GUMLOOP_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/gumloop"
    PRODUCTION_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + PRODUCTION_ANON_KEY
    }

    try:
        print("STEP 1: Received text input, length:", len(text))
        print("STEP 1.1: First 100 characters of text:", text[:100])

        # Validate JSON and check for required keys
        try:
            json_data = json.loads(text)
            print("STEP 2: Parsed JSON data")
            print(f"STEP 2.1: JSON keys: {list(json_data.keys())}")

            missing_keys = []
            expected_keys = ['profile']  # Only "profile" is strictly required
            optional_keys = ['fees', 'profile_img_url', 'license', 'clinic_profile_url', 'clinic_booking_url']
            
            for key in expected_keys:
                if key not in json_data:
                    missing_keys.append(key)
            
            # Log a warning for missing optional keys
            for key in optional_keys:
                if key not in json_data:
                    print(f"Warning: Optional key '{key}' is missing")
            
            if missing_keys:
                print(f"STEP 2.2: Missing required keys: {missing_keys}")
                return json.dumps({
                    "success": False,
                    "error": "Missing required keys",
                    "missing_keys": missing_keys
                })
            
            # *IMPORTANT*: The edge function expects 'profile' to be a string
            # If profile is an object, convert it to a JSON string
            if isinstance(json_data.get('profile'), dict):
                print("STEP 2.3: Profile is an object, converting to JSON string")
                json_data['profile'] = json.dumps(json_data['profile'])
                print("STEP 2.3.1: Successfully converted profile to string")
            elif not isinstance(json_data.get('profile'), str):
                print(f"STEP 2.4: Invalid profile type: {type(json_data.get('profile'))}")
                return json.dumps({
                    "success": False,
                    "error": "Invalid data type",
                    "message": "The 'profile' field must be a string or object"
                })
            
            # Convert license to string if it's an object
            if isinstance(json_data.get('license'), dict):
                print("STEP 2.5: License is an object, converting to JSON string")
                json_data['license'] = json.dumps(json_data['license'])
                print("STEP 2.5.1: Successfully converted license to string")
            
            # Convert fees array to array of strings if needed
            if 'fees' in json_data and isinstance(json_data['fees'], list):
                print(f"STEP 2.6: Processing {len(json_data['fees'])} fee items")
                string_fees = []
                for i, fee in enumerate(json_data['fees']):
                    if isinstance(fee, dict):
                        string_fees.append(json.dumps(fee))
                    else:
                        string_fees.append(fee)
                json_data['fees'] = string_fees
                print(f"STEP 2.6.1: Processed all fees, now have {len(string_fees)} fee strings")
            
            # Validate URL fields (should be strings if present)
            url_fields = ['profile_img_url', 'clinic_profile_url', 'clinic_booking_url']
            for field in url_fields:
                if field in json_data and not isinstance(json_data[field], str):
                    print(f"STEP 2.7: Invalid {field} type: {type(json_data.get(field))}")
                    return json.dumps({
                        "success": False,
                        "error": "Invalid data type",
                        "message": f"The '{field}' field must be a string"
                    })
            
        except json.JSONDecodeError as e:
            print(f"STEP ERROR: JSON decode error: {str(e)}")
            return json.dumps({
                "success": False,
                "error": "Invalid JSON",
                "message": f"The input data is not valid JSON: {str(e)}"
            })
        
        print("STEP 3: Making POST request to edge function")
        print(f"STEP 3.1: Using URL: {EDGE_FUNCTION_GUMLOOP_URL}")
        print(f"STEP 3.2: Headers: {headers}")
        print(f"STEP 3.3: Sending data with profile type: {type(json_data['profile'])}")
        print(f"STEP 3.4: First 100 chars of profile: {json_data['profile'][:100]}")
        
        # Make POST request to edge function with JSON data
        response = requests.post(
            EDGE_FUNCTION_GUMLOOP_URL, 
            headers=headers, 
            json=json_data  # Use json parameter to automatically handle JSON serialization
        )
        
        print(f"STEP 4: Received response with status code: {response.status_code}")
        
        if response.status_code >= 400:
            print(f"STEP 4.1: Error response body: {response.text[:200]}")
        
        # Raise exception for bad status codes
        response.raise_for_status()

        # Return the response as a string
        print("STEP 5: Successfully processed request")
        return response.text

    except requests.exceptions.RequestException as e:
        print(f"STEP ERROR: Request error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Request error",
            "message": str(e)
        })
    except Exception as e:
        print(f"STEP ERROR: Unexpected error: {str(e)}")
        return json.dumps({
            "success": False,
            "error": "Unexpected error",
            "message": str(e)
        })

# Test data that matches the structure expected by the edge function
test="""
{
  "profile": {
    "first_name": "Laura",
    "middle_name": null,
    "last_name": "Langen",
    "pronouns": "she/her",
    "gender": "female",
    "sexuality": "prefer_not_to_say",
    "ethnicity": "white",
    "faith": "prefer_not_to_say",
    "bio": "Hi! My name is Laura and I am an RCC at Peak. I was born and raised in Saskatoon where I completed my business degree which supported me in my years of leadership and business development with value aligned companies. Although I loved my work, my personal experiences with mental health and witnessing the need for quality mental health care led me to go back to school and dedicate my career to mental health. I personally have gone through my own mental health challenges and know what it is like to be in the dark and thinking things will not get better. I am here to tell you they can and although life can be hard, it can be really beautiful too.",
    "clinic_name": "Peak Resilience Counselling",
    "clinic_street": "Unit 601-808 Nelson St.",
    "clinic_city": "Vancouver",
    "clinic_postal_code": "V6Z 2H2",
    "clinic_province": "BC",
    "clinic_country": "CA",
    "clinic_profile_url": "https://www.peak-resilience.com/counsellors/laura-langen",
    "clinic_booking_url": "https://peak-resilience.janeapp.com/",
    "therapist_email": "hello@elementaltherapy.ca",
    "availability": "both",
    "education": [
      "Bachelor of Science at UBC in biopsychology, Master of Counselling degree from City University of Canada"
    ],
    "certifications": [
      "Registered Clinical Counsellor #20828, Registered with CVAP as a counsellor"
    ],
    "approaches": ["Acceptance and Commitment Therapy (ACT)", "Cognitive Behavioural Therapy (CBT)", "Eye Movement Desensitization and Reprocessing (EMDR)"],
    "areas_of_focus": [
      "ADHD, Anxiety, Boundary Setting, Break-Ups, Burnout, Career, Childhood Trauma, Communication Skills, Dating, Depression, Dissociation, Emotional Regulation and Anger, Goal Setting, Grief and Loss, Identity, Life Meaning and Purpose, Life Transitions, Motivation, Nervous System Regulation, Neurodivergence, Perfectionism, PTSD / Complex PTSD, Relationship Issues, Self Worth and Personal Growth, Self-Esteem, Sex Therapy, Shame, Stress Management and Stress Reduction, Trauma"
    ],
    "languages": ["English"]
  },
  "fees": [
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
  ],
  "profile_img_url": "https://www.peak-resilience.com/wp-content/uploads/2024/02/IMG_2916-1024x678.jpg",
  "clinic_profile_url": "https://www.peak-resilience.com/counsellors/laura-langen",
  "clinic_booking_url": "https://peak-resilience.janeapp.com/",
  "license": {
    "license_number": "20480",
    "title": "RCC",
    "state": "BC",
    "issuing_body": "BCACC",
    "expiry_date": null
  }
}
"""

main(test, {})