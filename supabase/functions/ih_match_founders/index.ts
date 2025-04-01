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

        // Initialize Supabase client - NO schema setting
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            // Remove db: { schema: "ih" }
        });

        // Get request body
        const {
            query,
            minMrr = null,
            maxMrr = null,
            limit = 10,
            matchThreshold = 0.5,
            existingEmbedding = null,
        } = await req.json();

        console.log("Request parameters:", {
            query,
            minMrr,
            maxMrr,
            limit,
            matchThreshold,
        });

        // Validate query
        if (!query && !existingEmbedding) {
            throw new Error("Query or existingEmbedding is required");
        }

        let embedding;

        // Generate embedding if not provided
        if (!existingEmbedding) {
            // Generate embedding for the query
            console.log("Generating embedding for query:", query);
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: query,
                encoding_format: "float",
            });
            embedding = embeddingResponse.data[0].embedding;
            console.log(
                "Generated embedding with dimensions:",
                embedding.length,
            );
        } else {
            embedding = existingEmbedding;
            console.log("Using provided embedding");
        }

        // Try different approaches to call the function
        let founders;
        let error;

        try {
            console.log(
                "Attempting to call match_founders using RPC with fully qualified name",
            );
            // Try using the fully qualified function name first
            const result = await supabase.rpc("ih.match_founders", {
                query_embedding: embedding,
                match_threshold: matchThreshold,
                min_mrr: minMrr,
                max_mrr: maxMrr,
                limit_count: limit,
            });

            founders = result.data;
            error = result.error;

            if (error) {
                console.log("Error with ih.match_founders:", error.message);

                // Fallback: Try using just the function name without schema
                console.log(
                    "Falling back to match_founders without schema prefix",
                );
                const fallbackResult = await supabase.rpc("match_founders", {
                    query_embedding: embedding,
                    match_threshold: matchThreshold,
                    min_mrr: minMrr,
                    max_mrr: maxMrr,
                    limit_count: limit,
                });

                founders = fallbackResult.data;
                error = fallbackResult.error;
            }

            console.log("RPC response:", {
                success: !error,
                resultCount: founders?.length || 0,
                error: error?.message,
            });
        } catch (err) {
            console.error("Error calling RPC:", err);
            throw new Error(
                `RPC error: ${
                    err instanceof Error ? err.message : String(err)
                }`,
            );
        }

        if (error) {
            throw new Error(`Error in match_founders: ${error.message}`);
        }

        return new Response(
            JSON.stringify({
                success: true,
                founders: founders || [],
                count: founders?.length || 0,
                query: query || "Using provided embedding",
                filters: {
                    minMrr,
                    maxMrr,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        console.error("Error in ih_match_founders:", error);

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
