import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";

interface Therapist {
    id: string;
    slug: string;
    clinic_country: string;
    clinic_province: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

console.log("Profile Slugs: Ready to serve requests");

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
        );

        // Parse query parameters
        const url = new URL(req.url);
        const pageSize = parseInt(url.searchParams.get("pageSize") || "60");
        const pageToken = url.searchParams.get("pageToken");

        // Limit page size to reasonable bounds
        const limitedPageSize = Math.min(Math.max(pageSize, 10), 1000);

        console.log(`[profile-slugs] Request received:
    - Page size: ${limitedPageSize} (requested: ${pageSize})
    - Page token: ${pageToken || "None (first page)"}`);

        // Build query with pagination - focusing only on id and slug
        let query = supabaseClient
            .from("therapists")
            .select("id, slug, clinic_country, clinic_province")
            .order("id", { ascending: true })
            .limit(limitedPageSize);

        // Apply pagination using 'id' as the cursor
        if (pageToken) {
            query = query.gt("id", pageToken);
        }

        const { data: therapists, error } = await query;

        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }

        // Filter to only include valid slugs
        const validSlugs = (therapists as Therapist[])
            .filter((t) => t.slug && /^[a-z0-9-]+-[a-z0-9]{6}$/.test(t.slug))
            .map((t) => ({
                slug: t.slug,
                id: t.id,
                clinic_country: t.clinic_country?.toLowerCase() || "ca",
                clinic_province: t.clinic_province?.toLowerCase() || "on",
            }));

        // Determine the next page token
        const nextPageToken = therapists.length === limitedPageSize
            ? therapists[therapists.length - 1].id
            : null;

        console.log(
            `[profile-slugs] Fetched ${validSlugs.length} valid slugs out of ${therapists.length} therapists`,
        );

        if (validSlugs.length > 0) {
            console.log(
                `[profile-slugs] Sample slugs: ${
                    JSON.stringify(validSlugs.slice(0, 3))
                }`,
            );
        }

        // Return paginated response with only the slugs
        return new Response(
            JSON.stringify({
                slugs: validSlugs,
                next_page_token: nextPageToken || null,
                count: validSlugs.length,
                total_queried: therapists.length,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("[profile-slugs] Error:", error);

        const errorMessage = error instanceof Error
            ? error.message
            : "Unknown error";
        const errorStack = error instanceof Error ? error.stack : undefined;

        return new Response(
            JSON.stringify({
                error: errorMessage,
                stack: errorStack,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            },
        );
    }
});
