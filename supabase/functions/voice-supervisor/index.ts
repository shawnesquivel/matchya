// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  CBT_PROMPTS,
  formatConversationContext,
  PLANNER_PROMPT,
  RESPONDER_CORE,
  STAGE_GUIDANCE,
} from "../therapyStages.ts";

// Helper to call OpenAI chat completions
async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  model = "gpt-4o",
) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) throw new Error("OpenAI API key not configured");
  const requestBody = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 1000,
  };
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  const result = await response.json();
  return result.choices[0].message.content;
}

console.log("Hello from Functions!");

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const requestData = await req.json();
    const { mode, stage, messages, userMessage } = requestData;
    if (mode !== "voice") {
      return new Response(
        JSON.stringify({ error: "Invalid mode for this endpoint" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 1. Call planner to decide next action/stage
    const plannerPrompt = PLANNER_PROMPT;
    const plannerUserMsg =
      formatConversationContext(stage, messages, userMessage) +
      "\nANALYSIS NEEDED: Should we stay in current stage, advance to next stage, or complete session?";
    const plannerDecisionRaw = await callOpenAI(
      plannerPrompt,
      plannerUserMsg,
      "gpt-4o",
    );
    let plannerDecision;
    try {
      plannerDecision = JSON.parse(plannerDecisionRaw);
    } catch (e) {
      plannerDecision = {
        action: "respond",
        reasoning: "Failed to parse planner output, defaulting to respond.",
      };
    }

    let newStage = stage;
    if (
      plannerDecision.action === "advance_stage" && plannerDecision.targetStage
    ) {
      newStage = Math.min(plannerDecision.targetStage, 5);
    } else if (plannerDecision.action === "complete_session") {
      newStage = 5;
    }

    // 2. Call responder for the actual bot message
    const responderPrompt = RESPONDER_CORE + "\n" +
      (STAGE_GUIDANCE[newStage as keyof typeof STAGE_GUIDANCE] || "");
    const responderUserMsg = formatConversationContext(
      newStage as keyof typeof CBT_PROMPTS,
      messages,
      userMessage,
    );
    const botMessage = await callOpenAI(
      responderPrompt,
      responderUserMsg,
      "gpt-4o",
    );

    const response = {
      messageId: `msg-${Date.now()}-${
        Math.random().toString(36).substring(2, 9)
      }`,
      botMessage,
      newStage: newStage !== stage ? newStage : undefined,
      reasoning: plannerDecision.reasoning,
      sessionComplete: newStage === 5,
    };
    console.log({ mode: "voice", ...response });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error({ mode: "voice", error: err.message || err.toString() });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/voice-supervisor' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
