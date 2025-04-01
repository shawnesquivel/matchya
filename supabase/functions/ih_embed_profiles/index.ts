import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import OpenAI from "npm:openai";

// CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
function handleCors(req: Request) {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        });
    }
    return null;
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        // Handle CORS preflight request
        const corsResponse = handleCors(req);
        if (corsResponse) return corsResponse;

        // Get environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing environment variables");
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
        });

        // Get request body
        const { batchSize = 10, forceUpdate = false } = await req.json();

        // Query founders without embeddings or force update all
        const query = supabase.from("ih.profiles");
        if (!forceUpdate) {
            query.is("embedding", null);
        }

        const { data: profiles, error } = await query
            .select("id, llm_founder_summary")
            .limit(batchSize);

        if (error) {
            throw new Error(`Error querying profiles: ${error.message}`);
        }

        console.log(`Processing ${profiles.length} profiles`);

        // Process each profile
        const updates = [];
        for (const profile of profiles) {
            if (!profile.llm_founder_summary) {
                console.log(
                    `Profile ${profile.id} has no llm_founder_summary, skipping`,
                );
                continue;
            }

            try {
                // Generate embedding
                const embeddingResponse = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: profile.llm_founder_summary,
                    encoding_format: "float",
                });

                const embedding = embeddingResponse.data[0].embedding;

                // Convert to Postgres vector format
                const vectorString = `[${embedding.join(",")}]`;

                // Update profile with embedding
                const { data, error: updateError } = await supabase
                    .from("ih.profiles")
                    .update({ embedding: vectorString })
                    .eq("id", profile.id)
                    .select("id, first_name, last_name");

                if (updateError) {
                    throw new Error(
                        `Error updating profile ${profile.id}: ${updateError.message}`,
                    );
                }

                updates.push({
                    id: profile.id,
                    success: true,
                    name: `${data?.[0]?.first_name || ""} ${
                        data?.[0]?.last_name || ""
                    }`.trim(),
                });

                console.log(`Updated embedding for profile ${profile.id}`);
            } catch (err: unknown) {
                console.error(`Error processing profile ${profile.id}:`, err);
                updates.push({
                    id: profile.id,
                    success: false,
                    error: err.message,
                });
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Processed ${profiles.length} profiles`,
                processed: updates,
                remaining: profiles.length -
                    updates.filter((u) => u.success).length,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Error in ih_embed_profiles:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
