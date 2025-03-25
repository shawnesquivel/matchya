// File: supabase/functions/embed_prompt/index.ts

// @deno-types="npm:@types/node"
const initStartTime = performance.now();
console.log("[Timing] Starting function initialization");

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Track if this is first initialization
let isFirstInit = true;

console.log("[Debug] Starting edge function: embed_prompt");

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

// Debug environment variables (redacted for security)
console.log("[Debug] Environment check:", {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseAnonKey: !!supabaseAnonKey,
  hasOpenaiApiKey: !!openaiApiKey,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

console.log(
  "[Timing] Total function initialization completed in",
  performance.now() - initStartTime,
  "ms",
);

Deno.serve(async (req) => {
  try {
    const requestStartTime = performance.now();
    console.log(
      `[Timing] Request started (${isFirstInit ? "COLD" : "WARM"} start)`,
    );
    isFirstInit = false;
    console.log("[Debug] New request received");

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(
        "[Debug] Request body received:",
        JSON.stringify(requestBody),
      );
    } catch (e: any) {
      console.error("[Error] JSON Parse failed:", e.message);
      throw new Error(`Invalid JSON: ${e.message}`);
    }

    if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) {
      throw new Error("Missing environment variables");
    }

    // Create client with just anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { ids, table, contentColumn, embeddingColumn } = requestBody;

    // Validate required parameters
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Missing or invalid 'ids' parameter");
    }
    if (!table) throw new Error("Missing 'table' parameter");
    if (!contentColumn) throw new Error("Missing 'contentColumn' parameter");
    if (!embeddingColumn) {
      throw new Error("Missing 'embeddingColumn' parameter");
    }

    console.log("[Debug] Validated parameters:", {
      table,
      contentColumn,
      embeddingColumn,
      idsCount: ids.length,
    });

    const BATCH_SIZE = 1;
    const batches = [];

    console.log(
      "[Debug] Processing prompts for table:",
      table,
      "ids:",
      ids,
    );

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    for (const [batchIndex, batchIds] of batches.entries()) {
      console.log(
        "[Debug] Processing batch",
        batchIndex + 1,
        "of",
        batches.length,
        "with IDs:",
        batchIds,
      );

      try {
        // Enhanced logging for the select query
        const selectQuery =
          `SELECT id, ${contentColumn} FROM ${table} WHERE id IN (${
            batchIds.map((id) => `'${id}'`).join(",")
          })`;
        console.log(`[SQL:SELECT] Executing: ${selectQuery}`);

        // Select rows that need embeddings
        const { data: rows, error: selectError } = await supabase
          .from(table)
          .select(`id, ${contentColumn}, prompt_id`)
          .in("id", batchIds);

        if (selectError) {
          console.error("[Error] Select query failed:", selectError);
          throw selectError;
        }

        console.log("[Debug] Retrieved", rows?.length, "rows for processing");
        console.log("[Debug] Row data:", JSON.stringify(rows));

        if (!rows || rows.length === 0) {
          console.error("[Error] No rows found for IDs:", batchIds);
          continue;
        }

        for (const [rowIndex, row] of (rows ?? []).entries()) {
          console.log(
            "[Debug] Processing row",
            rowIndex + 1,
            "of",
            rows?.length,
            "with ID:",
            row.id,
            "prompt_id:",
            row.prompt_id,
          );

          try {
            const { id, [contentColumn]: content } = row;

            if (!content) {
              console.error(
                `[Error] No content in column '${contentColumn}' for id ${id}`,
              );
              continue;
            }

            // Get the related question text
            let promptData = null;
            if (row.prompt_id) {
              console.log(
                `[Debug] Fetching prompt question for prompt_id: ${row.prompt_id}`,
              );
              const promptResult = await supabase
                .from("prompts")
                .select("question")
                .eq("id", row.prompt_id)
                .single();

              promptData = promptResult.data;
              console.log(`[Debug] Prompt data:`, promptData);

              if (promptResult.error) {
                console.error(
                  `[Warning] Could not fetch prompt question:`,
                  promptResult.error,
                );
              }
            } else {
              console.log(
                `[Debug] No prompt_id found for row ${id}, using only answer text`,
              );
            }

            // Combine question and answer for better embeddings
            // Format: "The best part of my work is" +  "helping people"
            const combinedContent = promptData
              ? `${promptData.question} ${content}`
              : content;

            // Generate embedding with combined text
            console.log(
              "[Debug] Generating embedding for content:",
              combinedContent.substring(0, 100) + "...",
            );

            const embeddingStartTime = performance.now();
            const embeddingResponse = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: combinedContent,
              encoding_format: "float",
            });
            console.log(
              `[Timing] Embedding generation took ${
                performance.now() - embeddingStartTime
              }ms`,
            );

            const embedding = embeddingResponse.data[0].embedding;
            console.log(
              "[Debug] Generated embedding dimensions with a size of ... and first 3 values:",
              embedding.length,
              embedding.slice(0, 3),
            );

            // Convert array to Postgres vector format
            const vectorString = `[${embedding.join(",")}]`;
            console.log("[Debug] Vector string length:", vectorString.length);

            // Enhanced logging for the update query
            const updateQuery =
              `UPDATE ${table} SET ${embeddingColumn} = '[vector data]' WHERE id = '${id}'`;
            console.log(`[SQL:UPDATE] Executing: ${updateQuery}`);

            const updateStartTime = performance.now();
            // Important: Removed .single() here that was causing the error
            const { data: updateData, error: updateError, status, statusText } =
              await supabase
                .from(table)
                .update({ [embeddingColumn]: vectorString })
                .eq("id", id);
            console.log(
              `[Timing] Update query took ${
                performance.now() - updateStartTime
              }ms`,
            );

            console.log("[Debug] Update response full details:", {
              status,
              statusText,
              data: updateData,
              error: updateError ? JSON.stringify(updateError) : null,
            });

            if (updateError) {
              console.error("[Error] Failed to save embedding:", updateError);
              throw new Error(
                `Failed to save embedding for id ${id}: ${updateError.message}`,
              );
            }

            // Verify the update with an explicit select
            console.log(
              `[SQL:VERIFY] Executing: SELECT id, ${embeddingColumn} FROM ${table} WHERE id = '${id}'`,
            );
            const verifyStartTime = performance.now();
            const { data: verifyData, error: verifyError } = await supabase
              .from(table)
              .select(`id, ${embeddingColumn}`)
              .eq("id", id)
              .single();
            console.log(
              `[Timing] Verification query took ${
                performance.now() - verifyStartTime
              }ms`,
            );

            const hasEmbedding = verifyData &&
              verifyData[embeddingColumn] !== null;

            console.log("[Debug] Verification response full:", {
              data: verifyData,
              has_embedding: hasEmbedding,
              embedding_exists: verifyData
                ? `${embeddingColumn} exists in response`
                : "no data returned",
              embedding_length: verifyData
                ? (verifyData[embeddingColumn]
                  ? `${String(verifyData[embeddingColumn]).length} chars`
                  : "null")
                : "N/A",
              error: verifyError ? JSON.stringify(verifyError) : null,
            });

            console.log(
              `[Result: embed_prompt] Saved embedding for prompt id ${id}, verified: ${hasEmbedding}`,
            );
          } catch (error: any) {
            console.error(
              "[Error] Failed processing row:",
              error.message,
              error.stack,
            );
            // Continue with next row
          }
        }

        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(
          "[Error] Batch processing failed:",
          error.message,
          error.stack,
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[Fatal Error]", {
      message: error.message,
      stack: error.stack,
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
      },
    );
  }
});
