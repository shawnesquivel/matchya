import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { codeBlock } from "common-tags";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
const CHAT_V3_LLM_PROVIDER = "gpt-4o-mini";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const defaultPrompt = codeBlock`
You are a therapy matching assistant focused on explaining why specific therapists match the user's needs.

Your job is to connect therapists' qualities to each need the user expressed. Use the form inputs and mentioned preferences to explain how therapists align with the selected filters.

Focus on explaining the RELEVANCE of each match to each NEED:
- Why this therapist might understand their specific situation
- How their expertise aligns with user's needs
- Any standout qualities that make them a particularly good fit

Be concise and focus on matching rationale rather than listing all details.
`;

// Handle OPTIONS requests for CORS
function handleCors(req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
}

Deno.serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const { chatId, messages, matchedTherapists } = await req.json();

    // Log received data
    console.log(
      "[chat-v3]: Received messages:",
      messages?.length || 0,
      "last message:",
      messages?.length > 0 ? messages[messages.length - 1].content : "none"
    );

    // Safely handle matchedTherapists
    const therapists = Array.isArray(matchedTherapists)
      ? matchedTherapists
      : [];
    console.log("[chat-v3]: Received matched therapists:", therapists.length);

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid message format",
          message: "I couldn't understand your request. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create prompt with therapist information
    const basePrompt = defaultPrompt;
    let fullPrompt = basePrompt;

    if (therapists.length > 0) {
      fullPrompt += "\n\nHere are the matched therapists:\n";
      therapists.forEach((therapist, index) => {
        fullPrompt += `\n${index + 1}. ${therapist.first_name} ${
          therapist.last_name
        }`;
        if (therapist.gender) fullPrompt += `, ${therapist.gender}`;
        if (therapist.ethnicity) fullPrompt += `, ${therapist.ethnicity}`;
        fullPrompt += `\nSpecialties: ${
          therapist.areas_of_focus?.join(", ") || "Not specified"
        }\n`;
        fullPrompt += `Bio: ${therapist.bio || "No bio available"}\n`;
      });

      fullPrompt +=
        "\nPlease help the user understand which therapist might be the best match for their needs.";
    } else {
      fullPrompt +=
        "\n\nNo therapists were found matching the user's criteria. Please explain this and suggest broadening their search.";
    }

    // Prepare the chat completion request
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_V3_LLM_PROVIDER,
        messages: [
          { role: "system", content: fullPrompt },
          ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const assistantMessage = result.choices[0].message.content;

    // Save the conversation to the database if chatId is provided
    if (chatId) {
      const { error } = await supabase.from("chat_messages").insert({
        chat_id: chatId,
        role: "assistant",
        content: assistantMessage,
      });

      if (error) {
        console.error("[chat-v3]: Error saving message to database:", error);
      }
    }

    // Return the response
    return new Response(
      JSON.stringify({
        message: assistantMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[chat-v3]: Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message:
          "I encountered an error while processing your request. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// curl -i --location --request POST 'http://localhost:54321/functions/v1/chat-v3' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --header 'Content-Type: application/json' \
// --data '{
//     "message": "Tell me about the therapists that match my needs",
//     "chatId": "test-123",
//     "messages": [],
//     "matchedTherapists": [
//         {
//             "id": "t1",
//             "first_name": "Sarah",
//             "last_name": "Chen",
//             "bio": "I specialize in cultural identity and anxiety",
//             "gender": "female",
//             "ethnicity": "asian",
//             "sexuality": "straight",
//             "faith": "buddhist",
//             "price": 150,
//             "availability": "online",
//             "languages": ["English", "Mandarin"],
//             "areas_of_focus": ["Anxiety", "Cultural Identity", "Depression"],
//             "approaches": {
//                 "long_term": ["CBT", "Mindfulness", "Psychodynamic"],
//                 "short_term": ["Solution-Focused", "CBT"]
//             },
//             "similarity": 0.85,
//             "ai_summary": "Experienced in helping clients navigate cultural identity and anxiety with a mindfulness-based approach"
//         }
//     ]
// }'
