// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { codeBlock } from "common-tags";
import { createClient } from "@supabase/supabase-js";

console.log("Chat Lotus: Hello!!");

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clerk JWT verification function
async function verifyClerkJWT(authHeader: string): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("MISSING_AUTH_HEADER");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Extract user ID from JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.sub;

    if (!userId) {
      throw new Error("NO_USER_ID_IN_JWT");
    }

    // Verify user exists in our profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(`[chat-lotus]: Profile lookup error for ${userId}:`, error);
      throw new Error(`PROFILE_LOOKUP_FAILED: ${error.message}`);
    }

    if (!profile) {
      throw new Error(`PROFILE_NOT_FOUND: ${userId}`);
    }

    return userId;
  } catch (error) {
    if (
      error instanceof Error && error.message.startsWith("PROFILE_") ||
      error.message.startsWith("NO_USER_ID") ||
      error.message.startsWith("MISSING_AUTH")
    ) {
      throw error; // Re-throw our custom errors
    }
    throw new Error(
      `JWT_DECODE_FAILED: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

// Database session management
async function findOrCreateSession(
  userId: string,
  sessionId: string,
  therapyType?: string,
): Promise<any> {
  console.log(
    `[chat-lotus]: Finding/creating session ${sessionId} for user ${userId}`,
  );

  // Try to find existing session
  const { data: existingSession, error: findError } = await supabase
    .from("lotus_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (existingSession) {
    console.log(`[chat-lotus]: Found existing session:`, existingSession);
    return existingSession;
  }

  // Create new session if not found
  const sessionData = {
    id: sessionId,
    user_id: userId,
    stage: "S1",
    context: {
      therapy_type: therapyType || "cbt",
      voice_mode: false,
      is_complete: false,
    },
    started_at: new Date().toISOString(),
  };

  const { data: newSession, error: createError } = await supabase
    .from("lotus_sessions")
    .insert([sessionData])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create session: ${createError.message}`);
  }

  console.log(`[chat-lotus]: Created new session:`, newSession);
  return newSession;
}

// Save message to database
async function saveMessage(
  sessionId: string,
  sender: "user" | "bot",
  content: string,
  llmPayload?: any,
): Promise<void> {
  const { error } = await supabase
    .from("lotus_messages")
    .insert([{
      session_id: sessionId,
      sender: sender,
      body: content,
      llm_payload: llmPayload || null,
      created_at: new Date().toISOString(),
    }]);

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  console.log(`[chat-lotus]: Saved ${sender} message to database`);
}

// Update session stage and completion
async function updateSession(
  sessionId: string,
  stage: number,
  isComplete: boolean = false,
): Promise<void> {
  const stageMap = { 1: "S1", 2: "S2", 3: "S3", 4: "S4", 5: "S5" };
  const stageValue = stageMap[stage as keyof typeof stageMap] || "S1";

  const { error } = await supabase
    .from("lotus_sessions")
    .update({
      stage: stageValue,
      ended_at: isComplete ? new Date().toISOString() : null,
      context: { is_complete: isComplete },
    })
    .eq("id", sessionId);

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }

  console.log(
    `[chat-lotus]: Updated session stage to ${stageValue}, complete: ${isComplete}`,
  );
}

// Types for request/response
interface LotusMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface LotusRequest {
  sessionId: string;
  stage: number;
  messages: LotusMessage[];
  userMessage: string;
}

interface LotusResponse {
  messageId: string;
  botMessage: string;
  newStage?: number;
  reasoning?: any;
  sessionComplete?: boolean;
  /** Flag indicating whether the first-aid LLM produced the final botMessage */
  usedFirstAid?: boolean;
}

// CBT Prompts for each stage
const CBT_PROMPTS = {
  1: "Warmup - Build rapport and understand current emotional state. Focus on creating a safe space and gathering initial feelings.",
  2: "Exploration - Deep dive into specific issues, triggers, and thoughts. Identify patterns and core beliefs.",
  3: "Reframe - Help identify cognitive distortions and provide alternative perspectives. Introduce coping strategies and tools.",
  4: "Summary - Synthesize insights, celebrate progress, and provide actionable takeaways for continued practice.",
  5: "Complete - Session complete. Provide encouragement and suggestions for future practice.",
};

// Stage 1: Planner LLM
const PLANNER_PROMPT = codeBlock`
You are a CBT therapy session planner. Analyze the conversation and decide the next action.

CURRENT STAGE INFO:
Stage 1: Warmup - Build rapport, understand current emotional state, validate feelings. Focus on creating a safe space.
Stage 2: Exploration - Deep dive into specific issues/challenges, identify triggers, thoughts, and feelings. Look for patterns.
Stage 3: Reframe - Identify cognitive distortions, provide alternative perspectives, teach coping strategies and CBT techniques.
Stage 4: Summary - Synthesize insights, celebrate progress, provide actionable takeaways for continued practice.
Stage 5: Complete - Session finished. Provide encouragement and closure.

GUIDELINES:
- Stay in the current stage until its goals have been sufficiently addressed
- If the user explicitly says they have "already said" or "just told you", assume the necessary details are covered and either advance to the next stage or suggest an exercise—do not ask them to repeat.
- Never remain in the same stage for more than THREE back-and-forth exchanges.
- Progress to the next stage only when the user has engaged meaningfully with the current stage content
- Each stage should typically involve 2-3 exchanges before considering advancement
- Base stage advancement on:
  * Depth of user engagement
  * Emotional readiness
  * Completion of stage-specific therapeutic goals
- When advancing stages, ensure a smooth, natural transition
- Only advance one stage at a time (e.g., from 1→2 or 2→3, never 1→3)
- Complete the session (move to stage 5) only after a proper summary in stage 4

You must respond with valid JSON only:
{
  "action": "respond" | "advance_stage" | "complete_session",
  "targetStage": number (only if advancing),
  "reasoning": "Brief explanation of decision, including therapeutic justification"
}`;

// Short core principles (always included)
const RESPONDER_LOOP_SAFETY = codeBlock`
LOOP SAFETY:
- If the user indicates repetition or frustration (e.g., "I already said"), apologise once, briefly summarise what they shared, and move to a concrete next step or exercise. Do NOT ask them to repeat.
`;

const RESPONDER_CORE = codeBlock`
You are a warm, empathetic CBT therapist conducting a brief therapeutic session. Keep responses concise and focused.

CORE THERAPEUTIC PRINCIPLES:
- Validate emotions first before offering perspectives
- Use genuine empathy and warmth
- Keep responses short and conversational
- Ask ONE focused question maximum per response
- When providing CBT techniques, explain them simply
- Create a safe, non-judgmental space

LIVE GUIDED CBT:
- If suggesting a CBT tool or exercise, walk the user through the first step right now in the chat. Do NOT assign it as homework or suggest "try this later"—always do it live, step by step, together.
- Avoid open-ended or abstract questions. Offer a specific, simple next step or ask a focused question.
- Use plain language and concrete, relatable examples. Instead of technical terms, say things like "Let's try this together" or "Let's make a quick list right now."

RESPONSE STYLE:
- Warm, conversational tone (like a trusted mentor)
- 1-2 short sentences per paragraph
- Maximum 3 sentences total
- Balance validation with gentle guidance
- Use person's own words when possible
- Avoid jargon or overly clinical language
- ONE question maximum (except stage 5: zero questions)

Always respond as if you're having a real-time conversation with someone who deserves your full therapeutic presence.
` + RESPONDER_LOOP_SAFETY;

// Stage-specific guidance
const STAGE_GUIDANCE = {
  1: codeBlock`
Stage 1 (Warmup):
- Establish rapport and psychological safety
- Validate feelings without rushing to solutions
- Use reflective listening ("It sounds like...")
- Ask ONE gentle exploration question
- Normalize their emotional experience
`,
  2: codeBlock`
Stage 2 (Exploration):
- Identify specific situations, thoughts, and feelings
- Look for patterns and core beliefs
- Use ONE Socratic question to help them discover insights
- Help connect thoughts → feelings → behaviors
- Focus on one specific aspect at a time
`,
  3: codeBlock`
Stage 3 (Reframe):
- Identify ONE potential cognitive distortion gently
- Present alternative perspectives as possibilities
- Teach ONE practical CBT technique relevant to their situation
- Suggest one small, achievable thought exercise and do it live in the chat
- Emphasize their agency in choosing new perspectives
`,
  4: codeBlock`
Stage 4 (Summary):
- Highlight ONE key insight and progress made
- Connect their experience to ONE relevant CBT concept
- Provide ONE specific, personalized technique to practice
- Validate their efforts and courage
- End with hope and ONE practical next step
- Always end with a gentle, open invitation for user reflection, such as:
  "As we wrap up, what's one thing you want to remember from today, or how are you feeling about your progress?"
`,
  5: codeBlock`
Stage 5 (Complete):
- Express appreciation for their participation
- Highlight their strengths and insights
- Provide encouragement for continued practice
- End on a warm, supportive note
- NO questions in this stage
`,
};

// Conversation context generator
function formatConversationContext(
  stage: number,
  messages: LotusMessage[],
  userMessage: string,
) {
  const stageInfo = CBT_PROMPTS[stage as keyof typeof CBT_PROMPTS];
  const conversationHistory = messages.map((m) =>
    `${m.role.toUpperCase()}: ${m.content}`
  ).join("\n\n");

  return codeBlock`
    CURRENT STAGE: ${stage} - ${stageInfo}
    
    CONVERSATION HISTORY:
    ${conversationHistory}
    
    NEW USER MESSAGE: ${userMessage}
  `;
}

// Helper for model token parameter
function getTokenParamForModel(model: string, value: number) {
  return (model.startsWith("o3-") || model.startsWith("o4-"))
    ? { max_completion_tokens: value }
    : { max_tokens: value };
}

// Refactored callOpenAI to return content and finish_reason
async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  model = "o3-2025-04-16",
): Promise<{ content: string; finish_reason: string }> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    throw new Error("OpenAI API key not configured");
  }

  // Choose token limit based on model and use mapping function
  let tokenLimit = 300;
  if (model.startsWith("o3-") || model.startsWith("o4-")) tokenLimit = 1000;
  if (model === "o3-2025-04-16") tokenLimit = 1000;

  const requestBody: any = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    ...getTokenParamForModel(model, tokenLimit),
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
  const choice = result.choices[0];
  const content = choice.message.content;
  const finish_reason = choice.finish_reason || "unknown";

  return { content: content ? content.trim() : "", finish_reason };
}

// Helper: detect if user message is off-topic (not about feelings/mood)
function isOffTopic(message: string) {
  const feelingWords = [
    "feel",
    "feeling",
    "emotion",
    "mood",
    "anxious",
    "sad",
    "happy",
    "stressed",
    "worried",
    "angry",
    "upset",
    "excited",
    "tired",
    "depressed",
    "calm",
    "relaxed",
    "nervous",
  ];
  const lower = message.toLowerCase();
  return !feelingWords.some((w) => lower.includes(w));
}

// Add a concise first-aid instruction snippet for the backup model
const FIRST_AID_INSTRUCTION = codeBlock`
The main responder LLM failed to produce a helpful reply. Provide a supportive, brief, and actionable response to help the user continue their CBT session.

GUIDELINES FOR FIRST-AID RESPONSE:
- Tone: warm, encouraging, reassuring
- Length: 1-2 short sentences (max 3)
- Focus: validation + one gentle next step or question (unless stage 5, then no questions)
- Do NOT mention any technical issues or that another model failed.
`;

Deno.serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Step 1: Verify Clerk JWT and extract user ID
    const authHeader = req.headers.get("Authorization");
    let userId: string;

    try {
      userId = await verifyClerkJWT(authHeader || "");
      console.log(`[chat-lotus]: Authenticated user: ${userId}`);
    } catch (authError) {
      console.error("[chat-lotus]: Authentication failed:", authError);
      const errorMessage = authError instanceof Error
        ? authError.message
        : String(authError);

      // Provide specific error codes for different auth failures
      let statusCode = 401;
      let errorCode = "AUTH_FAILED";

      if (errorMessage.includes("PROFILE_NOT_FOUND")) {
        errorCode = "PROFILE_NOT_FOUND";
        statusCode = 404;
      } else if (errorMessage.includes("PROFILE_LOOKUP_FAILED")) {
        errorCode = "PROFILE_LOOKUP_FAILED";
        statusCode = 500;
      }

      return new Response(
        JSON.stringify({
          error: "Authentication failed",
          message: errorMessage,
          code: errorCode,
        }),
        {
          status: statusCode,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 2: Parse request
    const requestData: LotusRequest = await req.json();
    const { sessionId, stage, messages, userMessage } = requestData;

    console.log(
      `[chat-lotus]: User ${userId}, Session ${sessionId}, Stage ${stage}, Message: "${userMessage}"`,
    );

    // Step 3: Find or create session in database
    let dbSession;
    try {
      dbSession = await findOrCreateSession(userId, sessionId, "cbt");
    } catch (dbError) {
      console.error("[chat-lotus]: Database session error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Database session error",
          message: dbError.message,
          code: "DB_SESSION_FAILED",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 4: Save user message to database
    try {
      await saveMessage(sessionId, "user", userMessage);
    } catch (saveError) {
      console.error("[chat-lotus]: Failed to save user message:", saveError);
      // Continue processing but log the error
    }

    // Generate message ID
    const messageId = `msg-${Date.now()}-${
      Math.random().toString(36).substring(2, 9)
    }`;

    // Prepare context for planner
    const plannerInput =
      formatConversationContext(stage, messages, userMessage) + codeBlock`
      
      ANALYSIS NEEDED: Should we stay in current stage, advance to next stage, or complete session?
      Consider: Has the user engaged meaningfully with this stage's therapeutic goals?
    `;

    let warnings: string[] = [];
    // Stage 1: Call Planner LLM (use o3 for reasoning)
    console.log("[chat-lotus]: Calling Planner LLM...");
    console.log("[chat-lotus]: Planner prompt:\n", plannerInput);
    let plannerResponseRaw = "";
    let plannerFinishReason = "";
    try {
      const plannerResult = await callOpenAI(
        PLANNER_PROMPT,
        plannerInput,
        "o3-2025-04-16",
      );
      plannerResponseRaw = plannerResult.content;
      plannerFinishReason = plannerResult.finish_reason;
      if (!plannerResponseRaw) {
        warnings.push("Planner LLM returned empty response");
        throw new Error("Empty response from Planner LLM");
      }
      if (plannerFinishReason === "length") {
        warnings.push("Planner LLM output was truncated due to token limit");
      }
    } catch (error) {
      console.error("[chat-lotus]: Planner LLM failed:", error);
      warnings.push(
        "Planner LLM failed: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }

    let plannerDecision;
    let plannerWarning = "";
    if (plannerResponseRaw) {
      try {
        plannerDecision = JSON.parse(plannerResponseRaw);
      } catch (error) {
        // If not valid JSON, treat as meta-reasoning and pass to responder
        plannerWarning =
          "Planner LLM output was not valid JSON. Raw output passed to responder.";
        warnings.push(plannerWarning);
        plannerDecision = {
          action: "meta_analyze",
          reasoning: plannerResponseRaw,
        };
      }
    } else {
      // If plannerResponseRaw is empty, fallback
      if (isOffTopic(userMessage)) {
        plannerDecision = {
          action: "redirect",
          reasoning:
            "User is off-topic (e.g., talking about sports). Gently guide back to session goals.",
        };
      } else {
        plannerDecision = {
          action: "respond",
          reasoning: "Fallback: planner returned empty response",
        };
      }
    }

    console.log("[chat-lotus]: Planner decision:", plannerDecision);

    // Determine new stage
    let newStage = stage;
    if (
      plannerDecision.action === "advance_stage" && plannerDecision.targetStage
    ) {
      newStage = Math.min(plannerDecision.targetStage, 5);
    } else if (plannerDecision.action === "complete_session") {
      newStage = 5;
    }

    // Prepare context for responder
    let responderInput = RESPONDER_CORE +
      (STAGE_GUIDANCE[newStage] || "") +
      codeBlock`
      CURRENT STAGE: ${newStage} - ${
        CBT_PROMPTS[newStage as keyof typeof CBT_PROMPTS]
      }
      
      CONVERSATION HISTORY:
      ${
        messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join(
          "\n\n",
        )
      }
      
      NEW USER MESSAGE: ${userMessage}
      
      PLANNER DECISION: ${plannerDecision.reasoning}
      
      Please provide a therapeutic response appropriate for this stage.
      ${
        newStage !== stage
          ? `Note: Transitioning from stage ${stage} to stage ${newStage}.`
          : ""
      }
      NEXT STAGE: ${
        CBT_PROMPTS[(newStage + 1) as keyof typeof CBT_PROMPTS] || "None"
      }
    `;
    // If plannerDecision.action is meta_analyze, add a warning to the responder prompt
    if (plannerDecision.action === "meta_analyze") {
      responderInput += codeBlock`
        WARNING: The planner LLM failed to provide a valid plan. Please acknowledge this and help the user refocus on their feelings. Here is the raw planner output:
        ${plannerDecision.reasoning}
      `;
    }
    if (warnings.length > 0) {
      responderInput += codeBlock`
        SYSTEM WARNINGS:
        ${warnings.join("\n")}
      `;
    }

    // Inside Deno.serve handler – declare helper flag just after warnings array creation
    let usedFirstAid = false;

    // Stage 2: Call Responder LLM (primary)
    console.log("[chat-lotus]: Calling Responder LLM (primary)...");
    let botMessage = "";
    let responderFinishReason = "";
    try {
      const responderResult = await callOpenAI(
        RESPONDER_CORE,
        responderInput,
        "gpt-4.1-nano-2025-04-14",
      );
      botMessage = responderResult.content;
      responderFinishReason = responderResult.finish_reason;
      if (!botMessage) {
        warnings.push("Responder LLM returned empty response");
        throw new Error("Empty response from Responder LLM");
      }
      if (responderFinishReason === "length") {
        warnings.push("Responder LLM output was truncated due to token limit");
      }
    } catch (responderError) {
      console.error("[chat-lotus]: Responder LLM failed:", responderError);
      warnings.push(
        "Responder LLM failed: " +
          (responderError instanceof Error
            ? responderError.message
            : String(responderError)),
      );

      // === FIRST-AID BACKUP CALL ===
      console.log("[chat-lotus]: Invoking first-aid LLM backup...");
      try {
        const firstAidPrompt = FIRST_AID_INSTRUCTION + responderInput;
        const firstAidResult = await callOpenAI(
          RESPONDER_CORE,
          firstAidPrompt,
          "o4-mini-2025-04-16",
        );
        botMessage = firstAidResult.content;
        usedFirstAid = true;

        if (!botMessage) {
          warnings.push("First-aid LLM returned empty response");
          throw new Error("Empty response from First-aid LLM");
        }
      } catch (firstAidError) {
        console.error(
          "[chat-lotus]: First-aid LLM also failed:",
          firstAidError,
        );
        warnings.push(
          "First-aid LLM failed: " +
            (firstAidError instanceof Error
              ? firstAidError.message
              : String(firstAidError)),
        );

        // If planner suggested redirect or meta_analyze, prioritize those tailored fallbacks
        if (plannerDecision.action === "redirect") {
          botMessage =
            `I noticed you mentioned \"${userMessage}\". For this session, let's focus on how you're feeling right now. Can you share a bit about your current mood or emotions?`;
        } else if (plannerDecision.action === "meta_analyze") {
          botMessage =
            `I'm having trouble understanding the session plan, but I'm here to help you focus on your feelings. Let's talk about how you're feeling right now.`;
        } else {
          const fallbackResponses: Record<number, string> = {
            1: "I hear you. Can you tell me a bit more about what's on your mind right now?",
            2: "That sounds challenging. What thoughts go through your mind when this happens?",
            3: "I understand. Sometimes our thoughts can feel very real, even when they might not be entirely accurate. What if we looked at this from a different angle?",
            4: "You've shared some really important insights today. What feels most helpful to remember going forward?",
            5: "Thank you for sharing so openly today. You've shown real courage in exploring these feelings.",
          };
          botMessage =
            fallbackResponses[newStage as keyof typeof fallbackResponses] ||
            fallbackResponses[1];
        }
      }
    }

    // Step 5: Save bot message to database
    try {
      const llmPayload = {
        reasoning: plannerDecision,
        usedFirstAid,
        warnings: warnings.length > 0 ? warnings : undefined,
        finishReason: responderFinishReason,
      };
      await saveMessage(sessionId, "bot", botMessage.trim(), llmPayload);
    } catch (saveError) {
      console.error("[chat-lotus]: Failed to save bot message:", saveError);
      // Continue but log the error
    }

    // Step 6: Update session stage and completion status
    const isComplete = newStage === 5;
    try {
      await updateSession(sessionId, newStage, isComplete);
    } catch (updateError) {
      console.error("[chat-lotus]: Failed to update session:", updateError);
      // Continue but log the error
    }

    // Prepare response
    const response: LotusResponse & { warnings?: string[] } = {
      messageId,
      botMessage: botMessage.trim(),
      newStage: newStage !== stage ? newStage : undefined,
      reasoning: plannerDecision,
      sessionComplete: isComplete,
      warnings: warnings.length > 0 ? warnings : undefined,
      usedFirstAid,
    };

    console.log("[chat-lotus]: Response:", response);
    console.log(
      `[chat-lotus]: Database operations completed for session ${sessionId}`,
    );

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: unknown) {
    console.error("[chat-lotus]: Error:", error);

    return new Response(
      JSON.stringify({
        messageId: `error-${Date.now()}`,
        botMessage: "I'm sorry, I encountered an error. Please try again.",
        reasoning: {
          error: error instanceof Error ? error.message : String(error),
        },
        warnings: ["Critical error in chat-lotus edge function"],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-lotus' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
