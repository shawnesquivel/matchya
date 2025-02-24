import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
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
  initial_price: string;
  subsequent_price: string;
  availability: string;
  languages: string[];
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  try {
    const {
      chatId,
      messages,
      embedding: providedEmbedding,
      currentFilters,
      triggerSource,
    } = await req.json();

    console.log({ triggerSource });
    console.log(messages.length);
    console.log(messages);
    const embedding = providedEmbedding;

    const isFirstMessage = messages.length === 1;
    console.log(`[therapist-matches]: isFirstMessage ${isFirstMessage}`);
    const isUserAskingForTherapist = await determineUserMessageIntent(
      messages,
      {
        isFirstMessage,
        currentTherapists: messages.map((m) => ({
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
        })),
      }
    );

    console.log(
      "is the user asking for a therapist?",
      isUserAskingForTherapist
    );

    if (isUserAskingForTherapist.isTherapistRequest) {
      // C2: Run Query Builder with current filters context
      console.log("running query builder");
      const params = await determineMatchTherapistParameters(
        messages,
        currentFilters
      );

      // Pass the queries to DB function
      console.log("params", params);

      // DB: Get Therapists
      const { data: therapists, error: matchError } = await supabase
        .rpc("match_therapists", {
          query_embedding: embedding,
          match_threshold: 0.1,
          gender_filter: params.gender_filter,
          sexuality_filter: params.sexuality_filter,
          ethnicity_filter: params.ethnicity_filter,
          faith_filter: params.faith_filter,
          max_price_initial: params.max_price_initial,
          availability_filter: params.availability_filter,
        })
        .limit(10);
      console.log(therapists, matchError);
      console.log("ethnciity", therapists[0]?.ethnicity);

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

      // Create response with therapists and current filters
      const response = {
        therapists:
          therapists?.map((t: TherapistMatch) => ({
            id: t.id,
            first_name: t.first_name,
            last_name: t.last_name,
            ethnicity: t.ethnicity,
            gender: t.gender,
            sexuality: t.sexuality,
            faith: t.faith,
            initial_price: t.initial_price,
            subsequent_price: t.subsequent_price,
            availability: t.availability,
            languages: t.languages,
            areas_of_focus: t.areas_of_focus,
            approaches: t.approaches,
            similarity: t.similarity,
            ai_summary: t.ai_summary,
          })) || [],
        filters: {
          gender: params.gender_filter || null,
          sexuality: params.sexuality_filter || null,
          ethnicity: params.ethnicity_filter || null,
          faith: params.faith_filter || null,
          max_price_initial: params.max_price_initial || null,
          availability: params.availability_filter || null,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Not a therapist request, return empty response with empty filters
      return new Response(
        JSON.stringify({
          therapists: [],
          filters: {
            gender: null,
            sexuality: null,
            ethnicity: null,
            faith: null,
            max_price_initial: null,
            availability: null,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const determineUserMessageIntent = async (
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
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
  
  Consider a message as a therapist request if it mentions
  - demographic preferences (gender, ethnicity, age, etc.)
  - therapy style or approach preferences
  - availability or location preferences
  - price/cost preferences
  - Any indication they're looking for or want to find a therapist
  - Questions about specific types of therapists
  - specific issues they want help with
  
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
    ...messages,
  ];

  console.log(
    `[determineUserMessageIntent]: ${messages.length} ${messages[0]}`
  );

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
  currentFilters?: {
    gender: string | null;
    sexuality: string[] | null;
    ethnicity: string[] | null;
    faith: string[] | null;
    max_price_initial: number | null;
    availability: string | null;
  }
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
    sexuality_filter: z.array(Sexuality).nullable(),
    ethnicity_filter: z.array(Ethnicity).nullable(),
    faith_filter: z.array(Faith).nullable(),
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
For sexuality, ethnicity, and faith, return an array of values or null.

${
  currentFilters
    ? `
Current active filters:
${Object.entries(currentFilters)
  .filter(([_, value]) => value !== null)
  .map(
    ([key, value]) =>
      `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}

Only update filters that are explicitly mentioned in the new message.
Keep existing filters unless the user specifically changes them.
`
    : ""
}

Include reasoning for the extracted preferences or any ambiguity in the message`,
    },
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
