import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { codeBlock } from "common-tags";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

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
  ethnicity: string;
  sexuality: string;
  faith: string;
  price: number;
  availability: string;
  languages: string[];
};

type MatchTherapistParams = {
  query_embedding: number[];
  match_threshold: number;
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const defaultPrompt = codeBlock`
You are a friendly therapy matching assistant. Your goal is to help users find the right therapist based on their preferences and the search results.

When presenting therapist matches:
1. Acknowledge the user's specific preferences
2. Present the most relevant therapists from the search results
3. Highlight key matching attributes (especially those the user asked about)
4. If no exact matches, explain why and suggest broadening their search

Keep responses conversational but informative. Focus on the attributes the user cares about.
`;

Deno.serve(async (req) => {
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

  const isUserAskingForTherapist = await determineUserMessageIntent(
    messages,
    message,
    {
      isFirstMessage: messages.length === 0,
      currentTherapists: messages.map((m) => ({
        id: m.id,
        first_name: m.first_name,
        last_name: m.last_name,
      })),
    }
  );

  console.log("is the user asking for a therapist?", isUserAskingForTherapist);

  // Generate or hardcode chat_id
  const finalChatId = chatId || crypto.randomUUID();

  if (isUserAskingForTherapist.isTherapistRequest) {
    // C2: Run Query Builder
    console.log("runnign query builder");
    const params = await determineMatchTherapistParameters(messages, message);

    // Pass the queries to DB function
    console.log("params", params);

    // DB: Get Therapists
    const { data: therapists, error: matchError } = await supabase
      .rpc("match_therapists", {
        query_embedding: embedding,
        match_threshold: 0.5,
        gender_filter: params.gender_filter,
        sexuality_filter: params.sexuality_filter
          ? [params.sexuality_filter]
          : null,
        ethnicity_filter: params.ethnicity_filter
          ? [params.ethnicity_filter]
          : null,
        faith_filter: params.faith_filter ? [params.faith_filter] : null,
        max_price_initial: params.max_price_initial,
        availability_filter: params.availability_filter,
      })
      .limit(10);

    console.log(`Found ${therapists?.length} therapists`);

    if (matchError) {
      console.error("Error fetching therapists:", matchError);
      return new Response(
        JSON.stringify({
          error:
            "There was an error reading your therapists, please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("therapists", therapists);
    const matchTherapistResults =
      (therapists?.length ?? 0) > 0
        ? therapists
            .map((therapist: TherapistMatch) => {
              const focusAreas = therapist.areas_of_focus
                .slice(0, 3)
                .join(", ");
              const approaches = therapist.approaches.long_term
                .slice(0, 3)
                .join(", ");

              return `
${therapist.first_name} ${therapist.last_name}
Gender: ${therapist.gender}
Ethnicity: ${therapist.ethnicity}
Sexuality: ${therapist.sexuality}
Faith: ${therapist.faith}
Price: ${therapist.price}
Availability: ${therapist.availability}
Languages: ${therapist.languages}
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

    Here are the therapist matches based on your preferences:
    ${matchTherapistResults}
    `;

    console.log("matchTherapistResults", matchTherapistResults);
    console.log("systemContent", systemContent);

    const completionMessagesOpenAI: Array<OpenAI.Chat.ChatCompletionMessageParam> =
      [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: message,
        },
      ];
    console.log("completionMessagesOpenAI", completionMessagesOpenAI);
    const openaiStartTime = performance.now();

    let tokenCount = 0;

    const completionStream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: completionMessagesOpenAI,
      // max_tokens: 1024,
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
        // if (tokenCount % 10 === 0) {
        //   console.log(
        //     "[OpenAI] Tokens received:",
        //     tokenCount,
        //     "at",
        //     performance.now() - openaiStartTime,
        //     "ms"
        //   );
        // }
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

    // Add therapist data to headers
    const responseHeaders = {
      ...corsHeaders,
      "x-therapists": JSON.stringify(
        therapists?.map((t: TherapistMatch) => ({
          id: t.id,
          first_name: t.first_name,
          last_name: t.last_name,
          ethnicity: t.ethnicity,
          gender: t.gender,
          sexuality: t.sexuality,
          faith: t.faith,
          price: t.price,
          availability: t.availability,
          languages: t.languages,
          areas_of_focus: t.areas_of_focus,
          approaches: t.approaches,
          similarity: t.similarity,
          ai_summary: t.ai_summary,
        })) || []
      ),
    };

    console.log("[Debug] Sending therapist data in headers:", therapists);
    console.log("[Debug] Response headers:", responseHeaders);
    console.log("Returning streaming response", stream);
    return new StreamingTextResponse(stream, { headers: responseHeaders });
  } else {
    console.log("User is not asking for a therapist, just answering question");
    const completionStream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 1024,
      temperature: 0,
      stream: true,
    });

    // Update the stream handlers
    const stream = OpenAIStream(completionStream, {
      experimental_streamData: true,
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
  }
});

type DetermineUserMessageIntentResponse = {
  isTherapistRequest: boolean;
  answer: string;
};

type DetermineUserMessageIntentContext = {
  isFirstMessage: boolean;
  currentTherapists?: {
    id: string;
    first_name: string;
    last_name: string;
  }[];
};

const determineUserMessageIntent = async (
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  message: OpenAI.Chat.ChatCompletionMessageParam,
  context: DetermineUserMessageIntentContext
): Promise<DetermineUserMessageIntentResponse> => {
  /**
   * Use an LLM with 'Structured Outputs' to determine if the user is asking a 
   question, or is requesting therapist.
   *
   * Example { "answer": "DBT stands for Dialectic ...", "isTherapistRequest": 
   false}
   */

  const formattedMessageHistory = [
    {
      role: "system",
      content: `You are analyzing user messages in a therapy matching platform. Your goal is to identify when users are expressing preferences for therapists.

${
  context.currentTherapists
    ? `
The user is currently viewing these therapists:
${context.currentTherapists
  .map((t) => `- ${t.first_name} ${t.last_name}`)
  .join("\n")}

Consider it a therapist request if they:
- Ask about specific details (price, availability, etc.) of these therapists
- Want to compare these therapists
- Ask for more therapists with similar qualities
`
    : ""
}

${
  context.isFirstMessage
    ? `
For first messages, be more likely to interpret as a therapist request if they mention:
- Any preferences or needs
- Seeking help or therapy
- Personal situations
`
    : ""
}

Consider a message as a therapist request if it contains ANY of these:
- Mentions of demographic preferences (gender, ethnicity, age, etc.)
- Mentions of therapy style or approach preferences
- Mentions of availability or location preferences
- Mentions of price/cost preferences
- Any indication they're looking for or want to find a therapist
- Questions about specific types of therapists
- Mentions of specific issues they want help with

Even subtle hints about preferences should be treated as therapist requests.

Example therapist requests:
- "prefer pacific islanders"
- "looking for someone under $150"
- "need help with anxiety"
- "are there any female therapists?"
- "someone who does CBT"
- "available on weekends"

Only classify as NOT a therapist request if the message is:
- A general question about therapy concepts (e.g. "What is CBT?")
- Small talk or greetings
- Direct questions about the platform/service`,
    },
    {
      role: "user",
      content: message,
    },
    ...messages,
  ];

  const ClassifyUserIntent = z.object({
    isTherapistRequest: z.boolean(),
    explanation: z.string(),
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: formattedMessageHistory,
    response_format: zodResponseFormat(ClassifyUserIntent, "answer"),
  });

  console.log(completion.choices[0]);
  return completion.choices[0].message.parsed;
};

const determineMatchTherapistParameters = async (
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  message: OpenAI.Chat.ChatCompletionMessageParam
): Promise<z.infer<typeof FilterParams>> => {
  /**
   * Use an LLM to build the function call to Database Function: match_therapists.
   */

  // Define enums for better type safety
  const Gender = z.enum(["female", "male", "non_binary"]);
  const Sexuality = z.enum([
    "straight",
    "gay",
    "lesbian",
    "bisexual",
    "queer",
    "pansexual",
    "asexual",
    "questioning",
    "prefer_not_to_say",
  ]);

  // Update availability to be single value
  const Availability = z.enum(["online", "in_person", "both"]);
  const Ethnicity = z.enum([
    "asian",
    "black",
    "hispanic",
    "indigenous",
    "middle_eastern",
    "pacific_islander",
    "white",
    "multiracial",
    "prefer_not_to_say",
  ]);
  const Faith = z.enum([
    "christian",
    "jewish",
    "muslim",
    "hindu",
    "buddhist",
    "sikh",
    "atheist",
    "agnostic",
    "spiritual",
    "other",
    "prefer_not_to_say",
  ]);

  const FilterParams = z.object({
    gender_filter: Gender.nullable(),
    sexuality_filter: Sexuality.nullable(),
    ethnicity_filter: Ethnicity.nullable(),
    faith_filter: Faith.nullable(),
    max_price_initial: z.number().nullable(),
    availability_filter: Availability.nullable(),
    reasoning: z.string(),
  });

  const formattedMessages = [
    {
      role: "system",
      content: `Extract therapist preferences from the conversation.
Consider: gender, sexuality, ethnicity, faith, price limit, and availability.
If user doesn't specify a preference, use null.
For price, extract a maximum hourly rate number or null.
Include reasoning for the extracted preferences or any ambiguity in the message`,
    },
    { role: "user", content: message },
    ...messages,
  ];

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: formattedMessages,
    response_format: zodResponseFormat(FilterParams, "filters"),
  });

  console.log(
    `[determineMatchTherapistParameters] Completion: ${JSON.stringify(
      completion.choices[0].message.parsed
    )}`
  );

  return completion.choices[0].message.parsed;
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP requestz:

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
