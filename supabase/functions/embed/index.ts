// @deno-types="npm:@types/node"
const initStartTime = performance.now();
console.log("[Timing] Starting function initialization");

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Track if this is first initialization
let isFirstInit = true;

console.log("[Debug] Starting edge function: embed");

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

console.log(
  "[Timing] Total function initialization completed in",
  performance.now() - initStartTime,
  "ms"
);

Deno.serve(async (req) => {
  try {
    const requestStartTime = performance.now();
    console.log(
      `[Timing] Request started (${isFirstInit ? "COLD" : "WARM"} start)`
    );
    isFirstInit = false;
    console.log("[Debug] New request received");
    console.log("[Debug] CPU time used:", performance.now(), "ms");

    // Parse request body with better error logging
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("[Debug] Request body received:", {
        ...requestBody,
        content: requestBody?.content?.substring(0, 50) + "...", // Truncate long content
      });
    } catch (e) {
      console.error("[Error] JSON Parse failed:", e.message);
      throw new Error(`Invalid JSON: ${e.message}`);
    }

    if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) {
      throw new Error("Missing environment variables");
    }

    // Create client with just anon key, no auth needed
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { ids, table, contentColumn, embeddingColumn } = requestBody;
    const BATCH_SIZE = 1;
    const batches = [];
    console.log(
      "[Debug] Processing request for table:",
      table,
      "ids:",
      ids,
      "batchsize:",
      BATCH_SIZE
    );
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE) as never);
    }
    // console.log("[Debug] Created", batches.length, "batches");

    for (const [batchIndex, batchIds] of batches.entries()) {
      // console.log(
      //   "[Debug] Processing batch",
      //   batchIndex + 1,
      //   "of",
      //   batches.length
      // );
      console.log("[Debug] CPU time before batch:", performance.now(), "ms");

      try {
        const { data: rows, error: selectError } = await supabase
          .from(table)
          .select(`id, ${contentColumn}` as "*")
          .in("id", batchIds)
          .is(embeddingColumn, null);

        if (selectError) {
          throw selectError;
        }

        console.log("[Debug] Retrieved", rows?.length, "rows for processing");

        for (const [rowIndex, row] of (rows ?? []).entries()) {
          console.log(
            "[Debug] Processing row",
            rowIndex + 1,
            "of",
            rows?.length
          );
          console.log(
            "[Debug] CPU time before embedding:",
            performance.now(),
            "ms"
          );

          try {
            const { id, [contentColumn]: content } = row;

            if (!content) {
              console.error(
                `[Error] No content in column '${contentColumn}' for id ${id}`
              );
              continue;
            }

            // Generate embedding using OpenAI API
            const embeddingResponse = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: content,
              encoding_format: "float",
            });

            const embedding = embeddingResponse.data[0].embedding;
            console.log(
              "[Debug] Generated embedding for id:",
              id,
              "dimensions:",
              embedding.length
            );

            // Convert array to Postgres vector format
            const vectorString = `[${embedding.join(",")}]`;
            console.log(
              "[Debug] Vector format for Postgres:",
              vectorString.substring(0, 50) + "..."
            );

            console.log("[Debug] Attempting to save embedding for id:", id);

            const { data: updateData, error: updateError } = await supabase
              .from(table)
              .update({ [embeddingColumn]: vectorString })
              .eq("id", id)
              .select()
              .single();

            if (updateError) {
              console.error("[Error] Failed to save embedding:", updateError);
              throw new Error(
                `Failed to save embedding for id ${id}: ${updateError.message}`
              );
            }

            console.log(
              "[Debug] Update response:",
              updateData?.first_name,
              updateData.created_at
            );

            // Verification step
            const { data: verifyData, error: verifyError } = await supabase
              .from(table)
              .select(embeddingColumn)
              .eq("id", id)
              .single();

            if (verifyError || !verifyData?.[embeddingColumn]) {
              console.error(
                `[Error] Embedding verification failed for id ${id}:`,
                verifyError || "No embedding found after update"
              );
            } else {
              // Parse the embedding if it's stored as a string
              const verifiedEmbedding =
                typeof verifyData[embeddingColumn] === "string"
                  ? JSON.parse(verifyData[embeddingColumn])
                  : verifyData[embeddingColumn];

              console.log(
                `[Verified] Embedding saved successfully for id ${id}, dimensions:`,
                Array.isArray(verifiedEmbedding)
                  ? verifiedEmbedding.length
                  : "unknown",
                "type:",
                typeof verifyData[embeddingColumn]
              );
            }

            console.log(
              `[Success] Generated and saved embedding ${JSON.stringify({
                table,
                id,
                contentColumn,
                embeddingColumn,
              })}`
            );
          } catch (error) {
            console.error("[Error] Failed processing row:", error);
            // Continue with next row
          }
        }

        if (batches.length > 1) {
          console.log("[Debug] Adding delay between batches");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log("[Debug] No delay between batches set");
        }
      } catch (error) {
        console.error("[Error] Batch processing failed:", error);
        // Continue with next batch
      }
    }

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Fatal Error]", {
      message: error.message,
      time: performance.now() - initStartTime,
    });
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
        timeMs: performance.now() - initStartTime,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
