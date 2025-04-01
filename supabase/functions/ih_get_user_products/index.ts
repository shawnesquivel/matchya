// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

console.log("Get User Products Edge Function Started!");

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

        // Get the request body
        const { user_id } = await req.json();

        // Validate user_id
        if (!user_id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Missing user_id",
                    message: "user_id is required in the request body",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        console.log(`Fetching products for user_id: ${user_id}`);

        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                auth: { persistSession: false },
                db: {
                    schema: "ih",
                },
            },
        );

        // Query the profiles table
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("id, raw_product_links")
            .eq("user_id", user_id)
            .single();

        if (error) {
            console.error("Database query error:", error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Database error",
                    message: error.message,
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        if (!data) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Not found",
                    message: `No profile found for user_id: ${user_id}`,
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        // Return the raw_product_links
        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    id: data.id,
                    raw_product_links: data.raw_product_links,
                },
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (err) {
        console.error("Error processing request:", err);

        const error = err as Error;
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-user-products' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"user_id": "declan_gessel"}'
*/
