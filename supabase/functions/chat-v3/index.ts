import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { codeBlock } from "common-tags";
import { createPerformanceTracker } from "../_lib/performance.ts";

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
You are a friendly and supportive therapy matching assistant. Your tone is warm, encouraging, and genuinely helpful - like a knowledgeable friend who really wants to help.

Your job is to connect therapists' qualities to each need the user expressed, making the user feel heard and understood throughout the process. Use conversational language that's easy to relate to.

When explaining matches:
- Express genuine enthusiasm about potential good fits without overselling
- Highlight how each therapist's background might resonate with the user's situation
- Use supportive language that acknowledges the courage it takes to seek therapy
- Be conversational but respectful - use "you" language to connect directly with the user
- Always explain in simple terms, educating the user on any jargon or concepts that might be new to them
- Share specific ways a therapist's expertise might help with the user's unique challenges
- Acknowledge that finding the right therapist is a personal journey and validate their efforts in this process
- When mentioning therapy approaches or credentials, briefly explain why they matter in practical terms

Balance being friendly with being informative. Share insights about why each therapist might be a good match in a way that feels personal and thoughtful.

When responding about no matches or limited options:
- Be gently encouraging rather than apologetic
- Offer constructive suggestions for broadening their search
- Reassure them that finding the right fit sometimes takes time

IMPORTANT - Avoid generic, AI-like closings:
- Do NOT use phrases like "I'm here to help" or "Feel free to ask any questions"
- Do NOT end with "Let me know if you have any other questions"
- Do NOT use phrases that sound like customer service (e.g., "How else can I assist you today?")
- Never apologize for being an AI or mention being an AI assistant

Instead, end messages with:
- A specific, thoughtful question related to what the user just shared
- A gentle prompt that encourages the next step in their therapy journey
- A warm comment that acknowledges where they are in their process

Make your responses sound like they come from a thoughtful human therapist matching expert, not an AI assistant.
`;

// Handle OPTIONS requests for CORS
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
}

Deno.serve(async (req) => {
  const perf = createPerformanceTracker("chat-v3");

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
      messages?.length > 0 ? messages[messages.length - 1].content : "none",
    );

    // Safely handle matchedTherapists
    const allTherapists = Array.isArray(matchedTherapists)
      ? matchedTherapists
      : [];

    // Limit to top 3 therapists only to keep responses concise
    // We assume the therapists are already sorted by relevance (most relevant first)
    const therapists = allTherapists.slice(0, 3);

    console.log(
      "[chat-v3]: Received matched therapists:",
      allTherapists.length,
    );
    console.log("[chat-v3]: Processing top 3 therapists for response");

    // Log therapist names of the top 3
    const therapistCount = therapists.length;
    for (let i = 0; i < therapistCount; i++) {
      const therapist = therapists[i];
      console.log(
        "[chat-v3]: Top therapist",
        i + 1,
        ":",
        therapist.first_name,
        therapist.last_name,
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid message format",
          message: "I couldn't understand your request. Please try again.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create prompt with therapist information
    const basePrompt = defaultPrompt;
    let fullPrompt = basePrompt;

    if (therapists.length > 0) {
      fullPrompt += "\n\nHere are the top matched therapists for the user:\n";
      therapists.forEach((therapist, index) => {
        fullPrompt += `\n${
          index + 1
        }. ${therapist.first_name} ${therapist.last_name}`;

        // Basic demographics
        if (therapist.pronouns) fullPrompt += ` (${therapist.pronouns})`;
        if (therapist.gender) fullPrompt += `, Gender: ${therapist.gender}`;
        if (therapist.ethnicity && therapist.ethnicity.length) {
          fullPrompt += `, Ethnicity: ${therapist.ethnicity.join("/")}`;
        }

        // Practical information
        fullPrompt += `\nAvailability: ${
          therapist.availability || "Not specified"
        }`;
        fullPrompt += `\nLanguages: ${
          therapist.languages?.join(", ") || "English"
        }`;

        // Financial information
        if (therapist.initial_price) {
          fullPrompt += `\nInitial session: ${therapist.initial_price}`;
        }
        if (therapist.subsequent_price) {
          fullPrompt += `, Follow-up: ${therapist.subsequent_price}`;
        }

        // Professional information
        fullPrompt += `\nAreas of Focus: ${
          therapist.areas_of_focus?.join(", ") || "Not specified"
        }`;
        if (therapist.approaches) {
          // Handle approaches being either an array or an object with arrays inside
          let approachesList = [];
          if (Array.isArray(therapist.approaches)) {
            approachesList = therapist.approaches;
          } else if (typeof therapist.approaches === "object") {
            // Extract approaches from object structure like {long_term: [...], short_term: [...]}
            Object.values(therapist.approaches).forEach((arr) => {
              if (Array.isArray(arr)) approachesList.push(...arr);
            });
          }
          if (approachesList.length > 0) {
            fullPrompt += `\nApproaches: ${approachesList.join(", ")}`;
          }
        }

        // Educational background
        if (therapist.education && therapist.education.length) {
          fullPrompt += `\nEducation: ${therapist.education.join("; ")}`;
        }

        // Bio information
        fullPrompt += `\nBio: ${
          therapist.bio || therapist.ai_summary || "No bio available"
        }`;
        fullPrompt += "\n";
      });

      // Adjust the prompt to make it clear we're only showing the top matches
      if (allTherapists.length > 3) {
        fullPrompt +=
          `\nThese are the top 3 matches out of ${allTherapists.length} therapists found.`;
      }

      fullPrompt +=
        "\n\nPlease explain which of these therapists might be the best match for the user's specific needs, focusing on how their expertise and background align with what the user is looking for.";
    } else {
      fullPrompt +=
        "\n\nNo therapists were found matching the user's criteria. Please explain this and suggest broadening their search.";
    }

    console.log("fullPrompt", fullPrompt);

    // Prepare the chat completion request
    perf.startEvent("llm:openai");
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
      perf.endEvent("llm:openai", { error, status: response.status });
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    perf.endEvent("llm:openai", {
      model: CHAT_V3_LLM_PROVIDER,
      tokensUsed: result.usage?.total_tokens,
    });
    const assistantMessage = result.choices[0].message.content;

    // Save the user message to the database if chatId is provided
    if (chatId && messages && messages.length > 0) {
      const userMessage = messages[messages.length - 1];

      if (userMessage.role === "user") {
        perf.startEvent("database:saveUserMessage");
        const { error: userMsgError } = await supabase.from("chat_history")
          .insert({
            chat_id: chatId,
            message: userMessage.content,
            source: "USER",
            user_id: null, // Since all users are anonymous for now
            metadata: matchedTherapists && matchedTherapists.length > 0
              ? {
                matchedTherapistIds: matchedTherapists.map((t: any) => t.id),
                therapistCount: matchedTherapists.length,
                timestamp: new Date().toISOString(),
              }
              : {},
          });

        if (userMsgError) {
          console.error(
            "[chat-v3]: Error saving user message to database:",
            userMsgError,
          );
        }
        perf.endEvent("database:saveUserMessage");
      }
    }

    // Save the assistant message to the database if chatId is provided
    if (chatId) {
      perf.startEvent("database:saveMessage");
      const { error } = await supabase.from("chat_history").insert({
        chat_id: chatId,
        message: assistantMessage,
        source: "OPENAI",
        user_id: null, // Since all users are anonymous for now
        model: CHAT_V3_LLM_PROVIDER,
        metadata: matchedTherapists && matchedTherapists.length > 0
          ? {
            matchedTherapistIds: matchedTherapists.map((t: any) => t.id),
            therapistCount: matchedTherapists.length,
            tokensUsed: result.usage?.total_tokens,
            timestamp: new Date().toISOString(),
          }
          : {
            tokensUsed: result.usage?.total_tokens,
            timestamp: new Date().toISOString(),
          },
      });

      if (error) {
        console.error("[chat-v3]: Error saving message to database:", error);
        perf.endEvent("database:saveMessage", { error: error.message });
      } else {
        perf.endEvent("database:saveMessage");
      }
    }

    // Complete performance tracking
    perf.complete();

    // Return the response
    return new Response(
      JSON.stringify({
        message: assistantMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("[chat-v3]: Error:", error);
    perf.endEvent("llm:openai", {
      error: error instanceof Error ? error.message : String(error),
    });
    perf.complete();
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        message:
          "I encountered an error while processing your request. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
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
