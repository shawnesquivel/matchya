import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { codeBlock } from "common-tags";
import { createPerformanceTracker } from "../_lib/performance.ts";

// These are automatically injected
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);
const CHAT_V3_LLM_PROVIDER = "gpt-4o";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const defaultPrompt = codeBlock`
You are a friendly therapy matching assistant who speaks in first person and focuses on understanding users' needs. Think of yourself as a knowledgeable friend who listens first, then responds thoughtfully.

CORE PRINCIPLES:
1. Listen & Validate - Always acknowledge the user's perspective first
2. Keep it Personal - Use first names and conversational language
3. Stay Focused - One clear message or question at a time
4. Be Direct - Short paragraphs, simple language
5. Keep Engaging - End with a specific, relevant question

CONVERSATION STRUCTURE:
1. Acknowledge user's message (1 sentence)
2. Provide relevant information or response (1-2 paragraphs)
3. Ask a specific follow-up question

WRITING GUIDELINES:
- Use "I" statements ("I found some great matches" not "Here are matches")
- Keep paragraphs to 2-3 sentences maximum
- Explain technical terms in everyday language
- Use line breaks between different topics

THERAPIST DESCRIPTIONS:
Each therapist gets ONE paragraph following this format:
"I think you'll connect well with [First Name]. [Key approach explained simply]. [How this helps with user's specific needs]."

Example:
"I think you'll connect well with Sarah. She helps people work through anxiety using practical tools you can use in daily life, like breathing exercises and thought-tracking (what therapists call CBT). Her warm, encouraging style makes it easier to talk about difficult feelings."

HANDLING DIFFERENT SCENARIOS:

1. STANDARD MATCHES:
- Briefly introduce each therapist
- Connect their expertise to user's needs
- Ask which aspects resonate most

2. NO MATCHES:
- Acknowledge the challenge
- Ask about specific preferences
- Example: "What's the most important thing you're looking for in a therapist?"

3. USER FRUSTRATION:
- Validate feelings briefly
- Ask about specific concerns
- Example: "What kind of connection are you hoping to find?"

AVOID:
- Technical jargon without explanation
- Generic responses or questions
- Multiple questions at once
- Defending or explaining the process
- Customer service language
- AI/assistant references

ALWAYS END WITH:
One specific question that:
- References something the user mentioned
- Is easy to answer
- Moves the conversation forward

Remember: You're having a conversation, not giving a presentation. Keep it natural, focused, and engaging.`;

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
        fullPrompt += " - ";
        if (therapist.pronouns) fullPrompt += `${therapist.pronouns}, `;
        if (therapist.gender) fullPrompt += `${therapist.gender}, `;
        if (therapist.ethnicity && therapist.ethnicity.length) {
          fullPrompt += `${therapist.ethnicity.join("/")}`;
        }

        // Practical information
        fullPrompt += `\n• Availability: ${
          therapist.availability || "Not specified"
        }`;
        fullPrompt += `\n• Languages: ${
          therapist.languages?.join(", ") || "English"
        }`;

        // Financial information
        fullPrompt += "\n• Pricing: ";
        if (therapist.initial_price) {
          fullPrompt += `Initial: ${therapist.initial_price}`;
        }
        if (therapist.subsequent_price) {
          fullPrompt += `, Follow-up: ${therapist.subsequent_price}`;
        }

        // Professional information
        fullPrompt += `\n• Areas of Focus: ${
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
            fullPrompt += `\n• Approaches: ${approachesList.join(", ")}`;
          }
        }

        // Educational background
        if (therapist.education && therapist.education.length) {
          fullPrompt += `\n• Education: ${therapist.education.join("; ")}`;
        }

        // Bio information
        fullPrompt += `\n\nBio: ${
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
        "\n\nPlease explain which of these therapists might be the best match for the user's specific needs, focusing on how their expertise and background align with what the user is looking for. Remember to keep your paragraphs short (2-3 sentences maximum) and use simple language when describing each therapist.";
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
          {
            role: "system",
            content:
              "Remember to keep your paragraphs very short (2-3 sentences maximum). Use simple language and break up information into separate paragraphs.",
          },
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
