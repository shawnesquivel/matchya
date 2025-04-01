#!/bin/bash

# Make ite executable: 

curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ih-insert-product' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
--header 'Content-Type: application/json' \
--data '{
  "company_research": {
    "product_name": "JotBot",
    "landing_page_link": "https://myjotbot.com/",
    "description": "JotBot is an AI-powered writing assistant that mimics your personal writing style, equipped with real-time note-taking, source management, and advanced editing tools to help you write 100 times faster.",
    "total_user_count": "1 million",
    "has_freemium": true,
    "monthly_subscription_price": 20,
    "annual_subscription_price": 168,
    "industry": ["artificial_intelligence", "developer_tools", "education_edtech"],
    "llm_product_summary": "JotBot is an AI writing assistant that helps users write faster by providing features like AI autocomplete, source finding and citation, draft generation, and AI-powered editing."
  },
  "estimated_mrr": 1500000,
  "llm_mrr_analysis": "Based on the available data, JotBot shows strong monetization potential with a 7.5% conversion rate from free to paid users, suggesting a healthy MRR of $1.5M with room for growth through pricing optimization and enterprise features."
}'