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
            db: { schema: "ih" },
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

        // Validate query
        if (!query && !existingEmbedding) {
            throw new Error("Query or existingEmbedding is required");
        }

        let embedding;

        // Generate embedding if not provided
        if (!existingEmbedding) {
            // Generate embedding for the query
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: query,
                encoding_format: "float",
            });
            embedding = embeddingResponse.data[0].embedding;
        } else {
            embedding = existingEmbedding;
        }

        // Call the match_founders function
        const { data: founders, error } = await supabase.rpc("match_founders", {
            query_embedding: embedding,
            match_threshold: matchThreshold,
            min_mrr: minMrr,
            max_mrr: maxMrr,
            limit_count: limit,
        });

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
