import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log("[Debug]: Chat-V2");

import { createClient } from "@supabase/supabase-js";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { codeBlock } from "common-tags";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

type OpenAIToken = {
  text: string;
  type: "token";
};

type OpenAICompletion = {
  content: string;
  role: "assistant";
};

type TherapistMatch = {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  gender: "female" | "male" | "non_binary";
  ai_summary: string;
  areas_of_focus: string[];
  approaches: {
    long_term: string[];
    short_term: string[];
  };
  similarity: number;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const defaultPrompt = codeBlock`
  You're a chat bot, so keep your replies succinct.Is 
  Use the documents below to answer the question.
`;

Deno.serve(async (req) => {
  console.log("[chat-v2]: Hit");
  if (req.method === "OPTIONS") {
    console.log("CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables");
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const authorization = req.headers.get("Authorization");

  // Create a Supabase client - auth header is optional
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: authorization ? { headers: { authorization } } : {},
    auth: { persistSession: false },
  });

  const { chatId, message, messages, embedding, promptTemplate } =
    await req.json();

  console.log(
    `Received inputs ${chatId} ${message} ${embedding.length} (embedding length: ${embedding.length})`
  );

  // Generate or hardcode chat_id
  const finalChatId = chatId || crypto.randomUUID();

  // Start timing document matching
  const matchStartTime = performance.now();
  console.log("[Timing] Starting document matching");

  // Update the RPC call and response handling:
  const { data: documents, error: matchError } = await supabase
    .rpc<TherapistMatch>("match_therapists", {
      query_embedding: embedding, // Convert to PG vector format
      match_threshold: 0.8,
    })
    .limit(5);

  console.log(
    "[Timing] Document matching completed in",
    performance.now() - matchStartTime,
    "ms"
  );

  if (matchError) {
    console.error("Error fetching documents:", matchError);
    return new Response(
      JSON.stringify({
        error: "There was an error reading your documents, please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Update the template string to use more therapist info
  const matchTherapistResults =
    documents && documents.length > 0
      ? documents
          .map((therapist: TherapistMatch) => {
            const focusAreas = therapist.areas_of_focus.slice(0, 3).join(", ");
            const approaches = therapist.approaches.long_term
              .slice(0, 3)
              .join(", ");

            return `${therapist.first_name} ${therapist.last_name}
Gender: ${therapist.gender}
Summary: ${therapist.ai_summary}
Top Focus Areas: ${focusAreas}
Top Approaches: ${approaches}
Match Score: ${(therapist.similarity * 100).toFixed(1)}%

Bio: ${therapist.bio}
---`;
          })
          .join("\n\n")
      : "No matching therapists found";

  const systemContent = codeBlock`
    ${promptTemplate || defaultPrompt}

    Therapist Matches:
    ${matchTherapistResults}
  `;

  console.log("[OpenAI] System content:", systemContent);

  const completionMessages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    { role: "user", content: systemContent },
    ...messages,
  ];

  console.log("[OpenAI] Sending messages:", {
    count: completionMessages.length,
    estimatedTokens: Math.ceil(JSON.stringify(completionMessages).length / 4),
    roles: completionMessages.map((m) => m.role),
  });

  console.log("[Timing] Starting OpenAI request");
  const openaiStartTime = performance.now();
  let tokenCount = 0;

  const completionStream = await openai.chat.completions.create({
    //  in production, tag the specific model release, as the general name can point to different versions.
    model: "gpt-4o-mini",
    messages: completionMessages,
    // context_limit = input_tokens (chat history) + max_output_tokens
    // max_tokens = how many we can respond with.
    max_tokens: 1024,
    temperature: 0,
    stream: true,
  });

  // Update the stream handlers
  const stream = OpenAIStream(completionStream, {
    experimental_streamData: true,
    onStart: () => {
      console.log(
        "[OpenAI] Stream started at",
        performance.now() - openaiStartTime,
        "ms"
      );
    },
    onToken: (_token: OpenAIToken) => {
      tokenCount++;
      if (tokenCount % 10 === 0) {
        console.log(
          "[OpenAI] Tokens received:",
          tokenCount,
          "at",
          performance.now() - openaiStartTime,
          "ms"
        );
      }
    },
    onCompletion: (_completion: OpenAICompletion) => {
      const completionTime = performance.now() - openaiStartTime;
      console.log("[OpenAI] Completion stats:", {
        totalTokens: tokenCount,
        timeMs: completionTime,
        tokensPerSecond: (tokenCount / (completionTime / 1000)).toFixed(2),
      });
    },
    onFinal: async (completion: string) => {
      console.log("[Debug] AI completed. Inserting into chat_history...");
      const { data: insertAiData, error: insertAiError } = await supabase
        .from("chat_history")
        .insert({
          chat_id: finalChatId,
          message: completion,
          source: "OPENAI",
        });

      if (insertAiError) {
        console.error("[Error] Failed to insert AI message:", insertAiError);
      } else {
        console.log("[Debug] Inserted AI message row ID:", insertAiData);
      }
    },
  });

  console.log("Returning streaming response", stream);
  return new StreamingTextResponse(stream, { headers: corsHeaders });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-v2' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

// curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-v2' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --header 'Content-Type: application/json' \
// --data '{
//     "message": "Hello",
//     "chatId": "test-123",
//     "embedding": "[0.1, 0.2, 0.3]",
//     "promptTemplate": "You are a helpful assistant"
// }'
