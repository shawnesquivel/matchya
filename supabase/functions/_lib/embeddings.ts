import OpenAI from "openai";
import { createPerformanceTracker } from "./performance.ts";

// Track initialization and OpenAI client
let isClientInitialized = false;
let openaiClient: OpenAI | null = null;

/**
 * Initializes the OpenAI client if not already initialized
 * @returns The OpenAI client instance
 */
export async function initEmbeddingModel() {
  if (!isClientInitialized) {
    const perf = createPerformanceTracker("embeddings");
    perf.startEvent("client:initialization");
    console.log("[Embeddings] Initializing OpenAI client");
    const clientStartTime = performance.now();

    try {
      const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiApiKey) {
        throw new Error("OPENAI_API_KEY environment variable not set");
      }
      openaiClient = new OpenAI({
        apiKey: openaiApiKey,
      });
      isClientInitialized = true;
      const initTime = performance.now() - clientStartTime;
      perf.endEvent("client:initialization", {
        model: "text-embedding-3-small",
        initTimeMs: initTime,
      });
      perf.complete();
    } catch (error: unknown) {
      console.error("[Embeddings] Failed to initialize OpenAI client:", error);
      perf.endEvent("client:initialization", {
        error: error instanceof Error ? error.message : String(error),
      });
      perf.complete();
      throw error;
    }
  }

  return openaiClient;
}

/**
 * Generates an embedding vector for the provided text using OpenAI
 * @param text The text to generate embeddings for
 * @returns The embedding as both array and Postgres-compatible string
 */
export async function generateEmbedding(text: string) {
  const perf = createPerformanceTracker("embeddings");

  // Track client init if needed
  perf.startEvent("embedding:generate");
  const client = await initEmbeddingModel();

  try {
    console.log(
      "[Embeddings] Generating embedding for text:",
      text.substring(0, 50) + "...",
    );

    const embeddingResponse = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = embeddingResponse.data[0].embedding;
    const vectorString = `[${embedding.join(",")}]`;

    perf.endEvent("embedding:generate", {
      textLength: text.length,
      dimensions: embedding.length,
    });
    perf.complete();

    return {
      array: embedding,
      pgVector: vectorString,
    };
  } catch (error: unknown) {
    console.error("[Embeddings] Error generating embedding:", error);
    perf.endEvent("embedding:generate", {
      error: error instanceof Error ? error.message : String(error),
    });
    perf.complete();
    throw error;
  }
}
