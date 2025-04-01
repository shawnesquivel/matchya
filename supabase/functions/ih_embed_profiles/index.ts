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

// Option 1: Add a type definition
interface ProfileWithEmbedding {
    id: any;
    llm_founder_summary: any;
    embedding?: any;
}

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

        // Initialize Supabase client WITH schema setting
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            db: { schema: "ih" }, // Set schema here
        });

        // Get request body
        const { batchSize = 10, forceUpdate = false } = await req.json();

        console.log("Request received with params:", {
            batchSize,
            forceUpdate,
        });

        // Use different approach based on forceUpdate
        let profiles;
        let queryError;
        try {
            console.log("Running query with forceUpdate:", forceUpdate);

            if (forceUpdate) {
                // Get all profiles
                const result = await supabase.from("profiles")
                    .select("id, llm_founder_summary")
                    .limit(batchSize);

                profiles = result.data;
                queryError = result.error;
            } else {
                // Fallback approach: Get all profiles with embedding column and filter
                try {
                    console.log(
                        "Fetching profiles and filtering for NULL embeddings",
                    );

                    // Get profiles with their embedding column so we can filter
                    const result = await supabase.from("profiles")
                        .select("id, llm_founder_summary, embedding")
                        .limit(100); // Get more to find NULL ones

                    if (result.error) {
                        throw result.error;
                    }

                    // Filter in JavaScript for NULL embeddings
                    profiles = result.data?.filter((p) =>
                        p.embedding === null
                    ) || [];
                    profiles = profiles.slice(0, batchSize);

                    console.log(
                        `Found ${profiles.length} profiles with NULL embeddings`,
                    );
                } catch (err) {
                    console.error("Error fetching profiles:", err);
                    throw new Error(
                        `Failed to fetch profiles: ${
                            err instanceof Error ? err.message : String(err)
                        }`,
                    );
                }
            }

            console.log("Query completed");
        } catch (err) {
            console.error("Exception during query:", err);
            throw new Error(
                `Query exception: ${
                    err instanceof Error ? err.message : String(err)
                }`,
            );
        }

        if (queryError) {
            throw new Error(`Error querying profiles: ${queryError.message}`);
        }

        if (!profiles || profiles.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "No profiles to process",
                    processed: [],
                    remaining: 0,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
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
                    .from("profiles") // No "ih." prefix!
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
                    error: err instanceof Error ? err.message : String(err),
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
    } catch (error: unknown) {
        console.error("Error in ih_embed_profiles:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
