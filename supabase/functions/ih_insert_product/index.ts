// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

console.log("Product Analysis Edge Function Started!");

interface CompanyResearch {
  product_name: string;
  landing_page_link: string;
  description: string;
  total_user_count: string | number | null;
  has_freemium: boolean | null;
  monthly_subscription_price: number | null;
  annual_subscription_price: number | null;
  industry: string[];
  llm_product_summary: string;
}

interface ProductAnalysis {
  company_research: CompanyResearch;
  estimated_mrr: number | null;
  llm_mrr_analysis: string;
  profile_id: string; // UUID of the profile
  user_id: string; // user_id from the profile
}

// Helper function to safely convert to number or null
function toNumberOrNull(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

// Helper function to safely convert to boolean or null
function toBooleanOrNull(
  value: boolean | string | null | undefined,
): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  return null;
}

Deno.serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST requests are allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get and validate the request body
    const body = await req.json() as ProductAnalysis;

    // Validate required fields including profile_id and user_id
    if (!body.profile_id || !body.user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          message: "profile_id and user_id are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        db: { schema: "ih" },
      },
    );

    // 1. First, get the profile's first and last name
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", body.profile_id)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Profile not found",
          message: profileError?.message || "Could not find profile",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 2. Insert the product with safe conversions
    const productData = {
      product_name: body.company_research.product_name,
      landing_page_link: body.company_research.landing_page_link,
      description: body.company_research.description,
      total_user_count: toNumberOrNull(body.company_research.total_user_count),
      has_freemium: toBooleanOrNull(body.company_research.has_freemium),
      monthly_subscription_price: toNumberOrNull(
        body.company_research.monthly_subscription_price,
      ),
      annual_subscription_price: toNumberOrNull(
        body.company_research.annual_subscription_price,
      ),
      industry: body.company_research.industry,
      llm_product_summary: body.company_research.llm_product_summary,
      estimated_mrr: toNumberOrNull(body.estimated_mrr),
      llm_mrr_analysis: body.llm_mrr_analysis || "MRR analysis not available",
      mrr_calculation_complete: Boolean(
        body.estimated_mrr !== null && body.estimated_mrr !== undefined,
      ),
    };

    // Log the processed data
    console.log("Processed product data:", {
      ...productData,
      description: productData.description.substring(0, 50) + "...", // Truncate for logging
    });

    const { data: insertedProduct, error: productError } = await supabaseClient
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (productError || !insertedProduct) {
      console.error("Error inserting product:", productError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Product insertion failed",
          message: productError?.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 3. Create the profile-product relationship
    const relationshipData = {
      profile_id: body.profile_id,
      product_id: insertedProduct.id,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    };

    const { error: relationshipError } = await supabaseClient
      .from("profile_products")
      .insert(relationshipData);

    if (relationshipError) {
      console.error("Error creating relationship:", relationshipError);
      // Note: We don't return error here as the product is already inserted
      // Instead, we log it and include it in the response
    }

    // Return success response with created data
    return new Response(
      JSON.stringify({
        success: true,
        message: "Product created successfully",
        data: {
          product: insertedProduct,
          relationship: relationshipError
            ? "Failed to create relationship"
            : "Created successfully",
          relationship_error: relationshipError?.message,
          mrr_status: body.estimated_mrr === null
            ? "MRR calculation pending"
            : "MRR calculated",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:
  1. Run `supabase start`
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ih-insert-product' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{
      "company_research": {
        "product_name": "JotBot",
        "landing_page_link": "https://myjotbot.com/",
        "description": "AI-powered writing assistant..."
      },
      "mrr_analysis": "Based on user metrics...",
      "llm_mrr_analysis": "AI Analysis: Strong product-market fit..."
    }'
*/
