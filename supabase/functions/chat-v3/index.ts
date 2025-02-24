import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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

type TherapistMatch = {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  gender?: "female" | "male" | "non_binary";
  ai_summary?: string;
  areas_of_focus?: string[];
  approaches?: {
    long_term: string[];
    short_term: string[];
  };
  similarity?: number;
  ethnicity?: string;
  sexuality?: string;
  faith?: string;
  initial_price?: string;
  subsequent_price?: string;
  availability?: string;
  languages?: string[];
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const defaultPrompt = codeBlock`
You are a friendly therapy matching assistant. Your goal is to help users understand their matched therapists and find the right fit. 

When discussing therapist matches:
1. Acknowledge and re-iterate the user's specific needs/preferences
2. Present relevant details about each therapist
3. Highlight why they might be a good match
4. If they ask about specific aspects, focus on those
5. Always mention both initial and ongoing session costs when available
6. If the user asks about the cost of a specific therapist, mention the initial and ongoing session costs
Keep responses conversational but informative. Focus on helping users understand why each therapist might be a good fit for them.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
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

  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: authorization ? { headers: { authorization } } : {},
    auth: { persistSession: false },
  });

  try {
    const { chatId, messages, matchedTherapists } = await req.json();

    console.log(
      "[chat-v3]: Received messages:",
      messages.length,
      "last message:",
      messages[messages.length - 1]?.content
    );

    const validMessages = messages.filter(validateMessage);

    // Generate or use provided chat_id
    const finalChatId = chatId || crypto.randomUUID();

    // Format therapist information for the AI

    const therapistInfo = matchedTherapists?.length
      ? matchedTherapists
          .map((therapist: TherapistMatch) => {
            const focusAreas =
              therapist.areas_of_focus?.slice(0, 3)?.join(", ") || "";
            const approaches =
              therapist.approaches?.long_term?.slice(0, 3)?.join(", ") || "";

            return `
${therapist.first_name} ${therapist.last_name}
${therapist.gender ? `Gender: ${therapist.gender}` : ""}
${therapist.ethnicity ? `Ethnicity: ${therapist.ethnicity}` : ""}
${therapist.sexuality ? `Sexuality: ${therapist.sexuality}` : ""}
${therapist.faith ? `Faith: ${therapist.faith}` : ""}
${therapist.initial_price ? `Initial Session: ${therapist.initial_price}` : ""}
${
  therapist.subsequent_price
    ? `Ongoing Sessions: ${therapist.subsequent_price}`
    : ""
}
${therapist.availability ? `Availability: ${therapist.availability}` : ""}
${
  therapist.languages?.length
    ? `Languages: ${therapist.languages.join(", ")}`
    : ""
}
${focusAreas ? `Top Focus Areas: ${focusAreas}` : ""}
${approaches ? `Top Approaches: ${approaches}` : ""}
${
  therapist.similarity !== undefined
    ? `Match Score: ${(therapist.similarity * 100).toFixed(1)}%`
    : ""
}
${therapist.bio ? `\nBio: ${therapist.bio}` : ""}
${therapist.ai_summary ? `\nSummary: ${therapist.ai_summary}` : ""}
---`;
          })
          .join("\n\n")
      : "No matching therapists available";

    console.log("received matched therapists", matchedTherapists.length);

    const systemContent = codeBlock`
    ${defaultPrompt}

    Here are the current therapist matches:
    ${therapistInfo}
    `;
    const completionMessages = [
      {
        role: "system",
        content: systemContent,
      },
      ...validMessages,
    ];

    // Start performance tracking
    const openaiStartTime = performance.now();
    let tokenCount = 0;

    const completionStream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: completionMessages,
      temperature: 0,
      stream: true,
    });

    // Create stream with handlers
    const stream = OpenAIStream(completionStream, {
      experimental_streamData: true,
      onStart: () => {
        // console.log(
        //   "[OpenAI] Stream started at",
        //   performance.now() - openaiStartTime,
        //   "ms"
        // );
      },
      onToken: () => {
        tokenCount++;
      },
      onCompletion: () => {
        const completionTime = performance.now() - openaiStartTime;
        // console.log("[OpenAI] Completion stats:", {
        //   totalTokens: tokenCount,
        //   timeMs: completionTime,
        //   tokensPerSecond: (tokenCount / (completionTime / 1000)).toFixed(2),
        // });
      },
      onFinal: async (completion: string) => {
        // Store in chat history
        const { error: insertError } = await supabase
          .from("chat_history")
          .insert({
            chat_id: finalChatId,
            message: completion,
            source: "OPENAI",
          });

        if (insertError) {
          console.error("[Error] Failed to insert AI message:", insertError);
        }
      },
    });

    // Return streaming response with therapist data in headers
    return new StreamingTextResponse(stream, {
      headers: {
        ...corsHeaders,
        "x-therapists": JSON.stringify(matchedTherapists || []),
      },
    });
  } catch (error) {
    console.error("error", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

const validateMessage = (msg: any) => {
  if (!msg.role || !msg.content) {
    console.warn("Invalid message format:", msg);
    return false;
  }
  return true;
};

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
