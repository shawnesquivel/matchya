#!/bin/bash

# Test script for ih_insert_profile edge function
# Usage: ./test.bash [local|prod]

# Default to local testing
ENVIRONMENT=${1:-"local"}

if [ "$ENVIRONMENT" == "local" ]; then
  echo "Testing ih_insert_profile locally..."
  URL="http://localhost:54321/functions/v1/ih_insert_profile"
  TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
else
  echo "Testing ih_insert_profile in production..."
  URL="https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/ih_insert_profile"
  TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs"
fi

# Test data
JSON_PAYLOAD='{
  "profile_data": {
    "user_id": "jack.friks",
    "first_name": "Jack",
    "last_name": "Friks",
    "x_link": "https://x.com/jackfriks",
    "llm_founder_summary": "Jack Friks is an indie maker who recently achieved a milestone of $10K in monthly recurring revenue (MRR) across his products.",
    "total_estimated_mrr": 10000
  },
  "products_data": [
    {
      "product_name": "Post Bridge",
      "landing_page_link": "https://postbridge.io",
      "total_user_count": 2500,
      "has_freemium": true,
      "monthly_subscription_price": 10.75,
      "annual_subscription_price": 129,
      "estimated_mrr": 10000,
      "llm_mrr_analysis": "The founder explicitly stated that the total MRR across all products is $10K/month."
    },
    {
      "product_name": "Curiosity Quench",
      "landing_page_link": "https://curiosityquench.com",
      "total_user_count": 50000,
      "has_freemium": true,
      "estimated_mrr": null,
      "llm_mrr_analysis": "Specific pricing details are unavailable for Curiosity Quench."
    }
  ],
  "industries": ["b2b_enterprise", "consumer", "health_wellness", "education_edtech"]
}'

# Make the curl request
curl -i --location --request POST "$URL" \
  --header "Authorization: Bearer $TOKEN" \
  --header "Content-Type: application/json" \
  --data "$JSON_PAYLOAD"

# Add a newline at the end for readability
echo "" 