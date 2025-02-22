const initStartTime = performance.now();
console.log("[Timing] Starting function initialization");

import { createClient } from "@supabase/supabase-js";
// vercel library
import { OpenAIStream, StreamingTextResponse } from "ai";
// prompt formatting
import { codeBlock } from "common-tags";
//  uses the import_map to tag the speciifc verison of OpenAI
import OpenAI from "openai";

// Track initialization state and request count
let isFirstInit = true;
let requestCount = 0;
const functionStartTime = Date.now();

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

console.log(
  "[Timing] Function initialization completed in",
  performance.now() - initStartTime,
  "ms"
);

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
  requestCount++;
  const startTime = performance.now();
  const uptime = Date.now() - functionStartTime;

  console.log(
    `[Timing] Request #${requestCount} started (${
      isFirstInit ? "COLD" : "WARM"
    } start, function uptime: ${(uptime / 1000).toFixed(2)}s)`
  );
  isFirstInit = false;

  // Handle CORS
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

  if (!authorization) {
    console.log("No authorization header passed");
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create a Supabase client that includes the auth header
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization } },
    auth: { persistSession: false },
  });

  // Extract the actual token
  const token = authorization.replace("Bearer ", "");

  // Explicitly pass the token to getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    console.log("[Debug] No user found from token:", token);
  }
  console.log("HARDCODING USER ID");

  const { chatId, message, messages, embedding, promptTemplate } =
    await req.json();

  // Generate or hardcode chat_id
  const finalChatId = chatId || crypto.randomUUID();

  const { data: insertUserData, error: insertUserError } = await supabase
    .from("chat_history")
    .insert({
      chat_id: finalChatId,
      message: message,
      source: "USER",
      user_id: "d6208bd4-6219-46c6-8661-6195264764e0", // Use user ID from token or fallback
    });

  if (insertUserError) {
    console.error("[Error] Failed to insert user message:", insertUserError);
  } else {
    console.log("[Debug] Inserted user message row ID:", insertUserData);
  }

  // Start timing document matching
  const matchStartTime = performance.now();
  console.log("[Timing] Starting document matching");

  const { data: documents, error: matchError } = await supabase
    .rpc("match_document_sections", {
      embedding,
      match_threshold: 0.8,
    })
    .select("content")
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

  const injectedDocs =
    documents && documents.length > 0
      ? documents.map(({ content }) => content).join("\n\n")
      : "No documents found";
  // console.log("Injected documents:", injectedDocs);

  const systemContent = codeBlock`
    ${promptTemplate || defaultPrompt}

    Documents:
    ${injectedDocs}
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

  // Vercel AI SDK
  const stream = OpenAIStream(completionStream, {
    experimental_streamData: true,
    onStart: () => {
      console.log(
        "[OpenAI] Stream started at",
        performance.now() - openaiStartTime,
        "ms"
      );
    },
    onToken: (_token) => {
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
    onCompletion: (_completion) => {
      const completionTime = performance.now() - openaiStartTime;
      console.log("[OpenAI] Completion stats:", {
        totalTokens: tokenCount,
        timeMs: completionTime,
        tokensPerSecond: (tokenCount / (completionTime / 1000)).toFixed(2),
      });
    },
    onFinal: async (completion) => {
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
