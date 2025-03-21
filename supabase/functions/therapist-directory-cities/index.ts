// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @deno-types="npm:@supabase/supabase-js"
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};

console.log("Therapist Directory Cities: Ready to serve requests");

// Define valid countries and regions
const VALID_COUNTRIES = ["ca", "us"];
const VALID_REGIONS = {
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
                    headers: {
                        Authorization: req.headers.get("Authorization")!,
                    },
                },
                auth: { persistSession: false },
            },
        );

        // Parse query parameters
        const url = new URL(req.url);
        const country = url.searchParams.get("country");
        const region = url.searchParams.get("region");
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);

        // Validate required parameters
        if (!country) {
            return new Response(
                JSON.stringify({
                    error: "Missing country parameter",
                    debug: { requestUrl: req.url },
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        // Validate country
        if (!VALID_COUNTRIES.includes(country.toLowerCase())) {
            return new Response(
                JSON.stringify({
                    error: `Invalid country parameter: ${country}`,
                    validCountries: VALID_COUNTRIES,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        // Validate region if provided
        if (region) {
            const countryCode = country.toLowerCase();
            if (!VALID_REGIONS[countryCode].includes(region.toUpperCase())) {
                return new Response(
                    JSON.stringify({
                        error:
                            `Invalid region parameter: ${region} for country: ${country}`,
                        validRegions: VALID_REGIONS[countryCode],
                    }),
                    {
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                        status: 400,
                    },
                );
            }
        }

        console.log(
            `[therapist-directory-cities] Fetching cities for country: ${country}, region: ${
                region || "all"
            }`,
        );

        // Build query
        let query = supabaseClient.from("therapists").select("clinic_city");

        // Add country filter
        query = query.eq("clinic_country", country.toUpperCase());

        // Add region filter if provided
        if (region) {
            query = query.eq("clinic_province", region.toUpperCase());
        }

        // Ensure city is not null
        query = query.not("clinic_city", "is", null);

        // Execute query
        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Count occurrences of each city
        const cityCounts: Record<string, number> = {};
        data.forEach((therapist: any) => {
            const city = therapist.clinic_city.trim();
            if (city && city.length > 0) {
                // Normalize city name - capitalize first letter of each word
                const normalizedCity = city
                    .toLowerCase()
                    .split(" ")
                    .map((word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ");

                cityCounts[normalizedCity] = (cityCounts[normalizedCity] || 0) +
                    1;
            }
        });

        // Sort cities by count (descending) and take the top ones
        const popularCities = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([city]) => city);

        return new Response(
            JSON.stringify({
                data: {
                    cities: popularCities,
                    country: country.toUpperCase(),
                    region: region ? region.toUpperCase() : null,
                },
                debug: {
                    totalCities: popularCities.length,
                    requestedCountry: country,
                    requestedRegion: region,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error: any) {
        console.error("[therapist-directory-cities] Error:", error);

        return new Response(
            JSON.stringify({
                error: error.message ||
                    "An error occurred while fetching cities",
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

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/therapist-directory-cities?country=ca&region=BC' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
