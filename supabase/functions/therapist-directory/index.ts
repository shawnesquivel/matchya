// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

console.log("Therapist Directory: Ready to serve requests");

// Define valid countries and regions
const VALID_COUNTRIES = ["ca", "us"];
const VALID_REGIONS: Record<string, string[]> = {
  ca: ["BC", "ON"],
  us: ["CA", "NY"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
        auth: { persistSession: false },
      },
    );

    // Parse query parameters
    const url = new URL(req.url);
    const country = url.searchParams.get("country");
    const region = url.searchParams.get("region");
    const city = url.searchParams.get("city");
    const name = url.searchParams.get("name");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);

    // Validate country parameter if provided
    if (country && !VALID_COUNTRIES.includes(country.toLowerCase())) {
      return new Response(
        JSON.stringify({
          error: `Invalid country parameter: ${country}`,
          validCountries: VALID_COUNTRIES,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Validate region parameter if country is provided
    if (country && region) {
      const countryCode = country.toLowerCase();
      if (!VALID_REGIONS[countryCode].includes(region.toUpperCase())) {
        return new Response(
          JSON.stringify({
            error:
              `Invalid region parameter: ${region} for country: ${country}`,
            validRegions: VALID_REGIONS[countryCode],
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    console.log(`[therapist-directory] Fetching therapists with params:`, {
      country,
      region,
      city,
      name,
      page,
      pageSize,
      offset,
    });

    // Start building the query
    let query = supabaseClient
      .from("therapists")
      .select(
        `
        id, first_name, last_name, slug, gender, pronouns, 
        bio, profile_img_url, clinic_name, clinic_city, 
        clinic_province, clinic_country, availability, languages, 
        education, certifications, areas_of_focus, approaches, 
        is_accepting_clients, therapist_email, therapist_phone, 
        clinic_phone, clinic_street, clinic_postal_code, is_verified,
        fees:therapist_fees(*),
        licenses:therapist_licenses(*)
      `,
        { count: "exact" },
      );

    // Apply filters
    if (country) {
      query = query.eq("clinic_country", country.toUpperCase());
    }

    if (region) {
      query = query.eq("clinic_province", region.toUpperCase());
    }

    if (city) {
      query = query.ilike("clinic_city", `%${city}%`);
    }

    if (name) {
      query = query.or(
        `first_name.ilike.%${name}%,last_name.ilike.%${name}%`,
      );
    }

    // Execute the count query first to get total results
    const { count: countResult, error: countError } = await query;

    if (countError) {
      throw countError;
    }

    // Execute the paginated query
    const { data: therapists, error } = await query
      .range(offset, offset + pageSize - 1)
      .order("first_name", { ascending: true });

    if (error) {
      throw error;
    }

    // Process the therapists to add initial/subsequent prices
    const processedTherapists = therapists.map((therapist: any) => {
      const initialFee = therapist.fees?.find(
        (fee: any) =>
          fee.session_type === "individual" &&
          fee.session_category === "initial",
      );

      const subsequentFee = therapist.fees?.find(
        (fee: any) =>
          fee.session_type === "individual" &&
          fee.session_category === "subsequent",
      );

      return {
        ...therapist,
        initial_price: initialFee
          ? `$${initialFee.price}`
          : "Contact for pricing",
        subsequent_price: subsequentFee
          ? `$${subsequentFee.price}`
          : "Contact for pricing",
      };
    });

    const count = countResult || 0;

    return new Response(
      JSON.stringify({
        data: {
          therapists: processedTherapists,
          totalCount: count,
          page,
          pageSize,
          totalPages: Math.ceil(count / pageSize),
        },
        debug: {
          params: {
            country,
            region,
            city,
            name,
            page,
            pageSize,
          },
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("[therapist-directory] Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while fetching therapists",
        debug: {
          type: error.name,
          stack: error.stack,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/therapist-directory?country=ca&region=BC&page=1&pageSize=20' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
