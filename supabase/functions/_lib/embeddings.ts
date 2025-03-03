import { env } from "@xenova/transformers";
import { pipeline } from "@xenova/transformers";
import { createPerformanceTracker } from "./performance.ts";

// Configuration for transformers
env.useBrowserCache = false;
env.allowLocalModels = false;

// Track initialization
let isModelInitialized = false;
let embeddingGenerator: any = null;

/**
 * Initializes the embedding model if not already initialized
 * @returns The embedding generator pipeline
 */
export async function initEmbeddingModel() {
  if (!isModelInitialized) {
    const perf = createPerformanceTracker("embeddings");
    perf.startEvent("model:initialization");
    console.log("[Embeddings] Initializing embedding model");
    const modelStartTime = performance.now();

    try {
      embeddingGenerator = await pipeline(
        "feature-extraction",
        "Supabase/gte-small"
      );

      isModelInitialized = true;

      const initTime = performance.now() - modelStartTime;
      console.log(
        "[Embeddings] Model initialization completed in",
        initTime,
        "ms"
      );

      perf.endEvent("model:initialization", {
        model: "Supabase/gte-small",
        initTimeMs: initTime,
      });
      perf.complete();
    } catch (error) {
      console.error("[Embeddings] Failed to initialize pipeline:", error);
      perf.endEvent("model:initialization", { error: error.message });
      perf.complete();
      throw error;
    }
  }

  return embeddingGenerator;
}

/**
 * Generates an embedding vector for the provided text
 * @param text The text to generate embeddings for
 * @returns The embedding as both array and Postgres-compatible string
 */
export async function generateEmbedding(text: string) {
  const perf = createPerformanceTracker("embeddings");

  // Track model init if needed
  perf.startEvent("embedding:generate");
  const generator = await initEmbeddingModel();

  try {
    console.log(
      "[Embeddings] Generating embedding for text:",
      text.substring(0, 50) + "..."
    );

    const output = await generator(text, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);
    console.log(
      "[Embeddings] Generated embedding dimensions:",
      embedding.length
    );

    // Convert array to Postgres vector format
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
  } catch (error) {
    console.error("[Embeddings] Error generating embedding:", error);
    perf.endEvent("embedding:generate", { error: error.message });
    perf.complete();
    throw error;
  }
}
