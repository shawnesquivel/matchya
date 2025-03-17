import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { codeBlock } from "common-tags";
import { createPerformanceTracker } from "../_lib/performance.ts";

const FOLLOW_UP_LLM_PROVIDER = "gpt-4o";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const followUpPrompt = codeBlock`
You are an assistant that generates follow-up questions related to therapy matching.
Generate exactly 3 follow-up questions based on the conversation context and therapist profiles.

IMPORTANT: Questions must be written in FIRST PERSON, as if the user is asking them directly.
For example, instead of "Explain what CBT is", write "What is CBT and how does it work?"

IMPORTANT: DO NOT use the examples below verbatim. Create fresh, unique questions that are specific to the conversation context.

Your questions should be:

1. CONTEXTUAL - A question related to the user's specific interests, background, or concerns.
   Examples:
   - "Can you tell me how trauma-informed therapy might help me?"
   - "How can a therapist who understands cultural identity support me as a first-generation immigrant?"
   - "How can a therapist with LGBTQ+ experience assist me with my gender identity?"

2. EDUCATIONAL - A question about therapy terminology, techniques, or credentials.
   Examples:
   - "What is the difference between CBT and psychodynamic therapy?"
   - "What does it mean if a therapist has an LCSW or an LMFT?"
   - "How does EMDR help with trauma, and is it suitable for me?"

3. PROCESS - A practical question about therapy logistics, insurance, or getting started.
   Examples:
   - "Do therapists usually offer a free consultation?"
   - "How often will I meet with a therapist at the start?"
   - "If I don't connect with my therapist, how can I find a new one?"

Format your response as valid JSON array with each question having 'text' and 'type' fields:
[
  {"text": "What is the difference between CBT and psychodynamic therapy?", "type": "educational"},
  {"text": "How can a therapist who understands cultural identity support me as a first-generation immigrant?", "type": "contextual"},
  {"text": "Do therapists usually offer a free consultation?", "type": "process"}
]
`;

// Handle OPTIONS requests for CORS
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
}

// Define interfaces for message and therapist
interface ChatMessage {
  role: string;
  content: string;
}

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  pronouns?: string;
  gender?: string;
  ethnicity?: string[];
  education?: string[];
  areas_of_focus?: string[];
  approaches?: string[];
  [key: string]: any; // For other possible properties
}

interface Question {
  text: string;
  type: string;
}

Deno.serve(async (req) => {
  const perf = createPerformanceTracker("follow-up-questions");

  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const { messages, matchedTherapists, lastUserMessage } = await req.json();

    // Log received data
    console.log(
      "[follow-up-questions]: Received messages:",
      messages?.length || 0,
      "last message:",
      lastUserMessage || "none",
    );

    // Safely handle matchedTherapists
    const therapists: Therapist[] = Array.isArray(matchedTherapists)
      ? matchedTherapists
      : [];
    console.log(
      "[follow-up-questions]: Received matched therapists:",
      therapists.length,
    );

    if (!lastUserMessage) {
      return new Response(
        JSON.stringify({
          error: "Missing last user message",
          questions: [],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create prompt with therapist information
    const basePrompt = followUpPrompt;
    let fullPrompt = basePrompt;

    if (therapists.length > 0) {
      fullPrompt +=
        "\n\nHere are the matched therapists (use this information for contextual questions):\n";
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

        // Include credentials for jargon explanation opportunities
        if (therapist.education && therapist.education.length) {
          fullPrompt += `\nCredentials: ${therapist.education.join("; ")}`;
        }

        // Professional information
        fullPrompt += `\nAreas of Focus: ${
          therapist.areas_of_focus?.join(", ") || "Not specified"
        }`;

        // Add approaches if available
        if (
          therapist.approaches && Array.isArray(therapist.approaches) &&
          therapist.approaches.length > 0
        ) {
          fullPrompt += `\nApproaches: ${therapist.approaches.join(", ")}`;
        }
      });

      fullPrompt +=
        "\n\nRemember: Create questions that are highly specific to these therapists' backgrounds, specialties, and the user's interests. Don't use generic questions.";
    }

    // Add historical context from messages
    if (messages && messages.length > 0) {
      fullPrompt +=
        "\n\nHere's the relevant conversation history (use this to create contextually appropriate questions):\n";
      // Include the last few messages for context, limiting to prevent prompt from getting too long
      const relevantMessages = messages.slice(-5);
      relevantMessages.forEach((msg: ChatMessage) => {
        fullPrompt += `\n${msg.role}: ${msg.content}`;
      });
    }

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
        model: FOLLOW_UP_LLM_PROVIDER,
        messages: [
          { role: "system", content: fullPrompt },
          { role: "user", content: `Last user message: "${lastUserMessage}"` },
        ],
        temperature: 0.8, // Slightly higher temperature for more creative questions
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      perf.endEvent("llm:openai", { error, status: response.status });
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    perf.endEvent("llm:openai", {
      model: FOLLOW_UP_LLM_PROVIDER,
      tokensUsed: result.usage?.total_tokens,
    });

    let questions: Question[] = [];
    try {
      // Parse the JSON response - it should be a string containing JSON
      const content = result.choices[0].message.content;
      const parsedContent = JSON.parse(content);

      // Extract the questions array
      questions = Array.isArray(parsedContent)
        ? parsedContent
        : parsedContent.questions || [];

      // Ensure we have valid questions
      questions = questions.filter((q: Question) =>
        q && typeof q.text === "string"
      ).slice(0, 3);
    } catch (e) {
      console.error("[follow-up-questions]: Failed to parse questions:", e);
      questions = [];
    }

    // Complete performance tracking
    perf.complete();

    // Return the response
    return new Response(
      JSON.stringify({
        questions: questions,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("[follow-up-questions]: Error:", error);
    perf.complete();
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        questions: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
