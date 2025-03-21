// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};

console.log("Therapist Directory Regions: Ready to serve requests");

// Define valid countries and their regions (static lists for validation)
const VALID_COUNTRIES = ["ca", "us"];
const VALID_REGIONS: Record<string, string[]> = {
    ca: ["BC", "ON"],
    us: ["CA", "NY"],
};

// Define display names for regions
const REGION_NAMES: Record<string, Record<string, string>> = {
    ca: {
        BC: "British Columbia",
        ON: "Ontario",
    },
    us: {
        CA: "California",
        NY: "New York",
    },
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

        const countryCode = country.toLowerCase();
        if (!VALID_COUNTRIES.includes(countryCode)) {
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

        console.log(
            `[therapist-directory-regions] Fetching regions for country: ${country}`,
        );

        // Query to get the distinct regions that have therapists
        const { data, error } = await supabaseClient
            .from("therapists")
            .select("clinic_province")
            .eq("clinic_country", countryCode.toUpperCase())
            .not("clinic_province", "is", null)
            .order("clinic_province");

        if (error) {
            throw error;
        }

        // Extract distinct region codes
        const uniqueRegions = new Set<string>();
        data.forEach((item: any) => {
            if (item.clinic_province) {
                uniqueRegions.add(item.clinic_province);
            }
        });

        // Filter to only include valid regions for this country and add display names
        const regionList = Array.from(uniqueRegions)
            .filter((regionCode) =>
                VALID_REGIONS[countryCode].includes(regionCode)
            )
            .map((regionCode) => ({
                code: regionCode.toLowerCase(),
                name: REGION_NAMES[countryCode][regionCode] || regionCode,
            }));

        return new Response(
            JSON.stringify({
                data: {
                    regions: regionList,
                    country: countryCode.toUpperCase(),
                },
                debug: {
                    totalRegions: regionList.length,
                    requestedCountry: country,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error: any) {
        console.error("[therapist-directory-regions] Error:", error);

        return new Response(
            JSON.stringify({
                error: error.message ||
                    "An error occurred while fetching regions",
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

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/therapist-directory-regions?country=ca' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
