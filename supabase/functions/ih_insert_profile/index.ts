// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

console.log("Profile Insertion Edge Function Started!");

interface ProfileData {
  user_id: string;
  first_name: string;
  last_name?: string;
  profile_image_url?: string;
  x_link?: string;
  linkedin_url?: string;
  personal_website?: string;
  blog_url?: string;
  perplexity_analysis?: string;
  scraped_content?: string;
  raw_product_links?: string;
  total_estimated_mrr?: number;
  llm_founder_summary?: string;
}

interface ProductData {
  product_name: string;
  landing_page_link: string;
  description?: string;
  total_user_count?: number;
  has_freemium?: boolean;
  monthly_subscription_price?: number;
  annual_subscription_price?: number;
  blended_monthly_price?: number;
  paying_user_count?: number;
  estimated_mrr?: number;
  llm_mrr_analysis?: string;
  llm_product_summary?: string;
  scraped_content?: string;
}

interface ProfileRequest {
  profile_data: ProfileData;
  products_data: ProductData[];
  industries: string[];
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
    const body = await req.json() as ProfileRequest;

    // Validate required fields
    if (
      !body.profile_data || !body.profile_data.user_id ||
      !body.profile_data.first_name
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          message: "profile_data with user_id and first_name are required",
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

    // 1. First, upsert the profile
    const profileData = {
      user_id: body.profile_data.user_id,
      first_name: body.profile_data.first_name,
      last_name: body.profile_data.last_name || null,
      profile_image_url: body.profile_data.profile_image_url || null,
      x_link: body.profile_data.x_link || null,
      linkedin_url: body.profile_data.linkedin_url || null,
      personal_website: body.profile_data.personal_website || null,
      blog_url: body.profile_data.blog_url || null,
      perplexity_analysis: body.profile_data.perplexity_analysis || null,
      scraped_content: body.profile_data.scraped_content || null,
      raw_product_links: body.profile_data.raw_product_links || "", // Required field, use empty string if not provided
      total_estimated_mrr: toNumberOrNull(
        body.profile_data.total_estimated_mrr,
      ),
      llm_founder_summary: body.profile_data.llm_founder_summary || null,
    };

    // Log the processed profile data
    console.log("Processed profile data:", {
      ...profileData,
      // Truncate long text fields for logging
      perplexity_analysis: profileData.perplexity_analysis
        ? profileData.perplexity_analysis.substring(0, 50) + "..."
        : null,
      scraped_content: profileData.scraped_content
        ? profileData.scraped_content.substring(0, 50) + "..."
        : null,
      llm_founder_summary: profileData.llm_founder_summary
        ? profileData.llm_founder_summary.substring(0, 50) + "..."
        : null,
    });

    // Upsert the profile and get its ID
    const { data: insertedProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(profileData)
      .select("id")
      .single();

    if (profileError || !insertedProfile) {
      console.error("Error upserting profile:", profileError);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Profile insertion failed",
          message: profileError?.message || "Unknown error inserting profile",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Profile upserted successfully with ID:", insertedProfile.id);

    // 2. Process each product
    const profile_id = insertedProfile.id;
    const inserted_products = [];
    const skipped_products = [];
    let total_mrr = 0;

    for (const productItem of body.products_data) {
      // Skip products without required fields
      if (!productItem.product_name || !productItem.landing_page_link) {
        skipped_products.push({
          product_name: productItem.product_name || "Unknown",
          reason: "Missing required fields",
        });
        continue;
      }

      // Check if product already exists
      const { data: existingProduct } = await supabaseClient
        .from("products")
        .select("id, estimated_mrr")
        .eq("landing_page_link", productItem.landing_page_link)
        .maybeSingle();

      if (existingProduct) {
        console.log(
          `Product ${productItem.product_name} already exists, skipping insertion`,
        );
        skipped_products.push({
          product_name: productItem.product_name,
          reason: "Product already exists",
          product_id: existingProduct.id,
        });

        // Still add to total MRR if available
        if (existingProduct.estimated_mrr) {
          total_mrr += existingProduct.estimated_mrr;
        }

        // Add to profile_products relationship table if not already there
        const { data: existingRelation } = await supabaseClient
          .from("profile_products")
          .select("*")
          .eq("profile_id", profile_id)
          .eq("product_id", existingProduct.id)
          .maybeSingle();

        if (!existingRelation) {
          const relationshipData = {
            profile_id: profile_id,
            product_id: existingProduct.id,
            first_name: body.profile_data.first_name,
            last_name: body.profile_data.last_name || null,
          };

          const { error: relationshipError } = await supabaseClient
            .from("profile_products")
            .insert(relationshipData);

          if (relationshipError) {
            console.error(
              "Error creating relationship for existing product:",
              relationshipError,
            );
          } else {
            console.log(
              `Created relationship for existing product ${productItem.product_name}`,
            );
          }
        }

        continue;
      }

      // Prepare product data with the industries provided
      const productData = {
        product_name: productItem.product_name,
        landing_page_link: productItem.landing_page_link,
        description: productItem.description || null,
        total_user_count: toNumberOrNull(productItem.total_user_count),
        has_freemium: toBooleanOrNull(productItem.has_freemium),
        monthly_subscription_price: toNumberOrNull(
          productItem.monthly_subscription_price,
        ),
        annual_subscription_price: toNumberOrNull(
          productItem.annual_subscription_price,
        ),
        blended_monthly_price: toNumberOrNull(
          productItem.blended_monthly_price,
        ),
        paying_user_count: toNumberOrNull(productItem.paying_user_count),
        estimated_mrr: toNumberOrNull(productItem.estimated_mrr),
        llm_mrr_analysis: productItem.llm_mrr_analysis || null,
        llm_product_summary: productItem.llm_product_summary || null,
        scraped_content: productItem.scraped_content || null,
        industry: body.industries, // Use the industries provided at the top level
        mrr_calculation_complete: productItem.estimated_mrr !== null &&
          productItem.estimated_mrr !== undefined,
      };

      // Log the processed product data
      console.log("Processed product data:", {
        ...productData,
        description: productData.description
          ? productData.description.substring(0, 50) + "..."
          : null,
      });

      // Insert the product
      const { data: insertedProduct, error: productError } =
        await supabaseClient
          .from("products")
          .insert(productData)
          .select()
          .single();

      if (productError || !insertedProduct) {
        console.error("Error inserting product:", productError);
        skipped_products.push({
          product_name: productItem.product_name,
          reason: productError?.message || "Unknown error",
        });
        continue;
      }

      console.log(`Product ${productItem.product_name} inserted successfully`);
      inserted_products.push(insertedProduct);

      // Add to total MRR
      if (insertedProduct.estimated_mrr) {
        total_mrr += insertedProduct.estimated_mrr;
      }

      // Create relationship
      const relationshipData = {
        profile_id: profile_id,
        product_id: insertedProduct.id,
        first_name: body.profile_data.first_name,
        last_name: body.profile_data.last_name || null,
      };

      const { error: relationshipError } = await supabaseClient
        .from("profile_products")
        .insert(relationshipData);

      if (relationshipError) {
        console.error("Error creating relationship:", relationshipError);
      }
    }

    // 3. Update the profile's total_estimated_mrr based on the sum of all products
    if (total_mrr > 0) {
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ total_estimated_mrr: total_mrr })
        .eq("id", profile_id);

      if (updateError) {
        console.error("Error updating profile total MRR:", updateError);
      } else {
        console.log(`Updated profile total_estimated_mrr to ${total_mrr}`);
      }
    }

    // Return success response with created data
    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile and products processed successfully",
        data: {
          profile: {
            id: profile_id,
            user_id: body.profile_data.user_id,
            first_name: body.profile_data.first_name,
            last_name: body.profile_data.last_name,
            total_estimated_mrr: total_mrr > 0 ? total_mrr : null,
          },
          products: {
            inserted: inserted_products.length,
            skipped: skipped_products.length,
            details: {
              inserted: inserted_products.map((p) => ({
                id: p.id,
                name: p.product_name,
              })),
              skipped: skipped_products,
            },
          },
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
        message: error instanceof Error ? error.message : String(error),
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ih_insert_profile' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{
      "profile_data": {
        "user_id": "jack.friks",
        "first_name": "Jack",
        "last_name": "Friks",
        "x_link": "https://x.com/jackfriks",
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
          "llm_mrr_analysis": "The founder explicitly stated that the total MRR across all products is $10K/month. Since Post Bridge is a significant contributor, its MRR is assumed to align with this figure."
        }
      ],
      "industries": ["b2b_enterprise", "consumer"]
    }'
*/
