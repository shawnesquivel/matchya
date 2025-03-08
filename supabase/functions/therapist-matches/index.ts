import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { generateEmbedding } from "../_lib/embeddings.ts";
import { createPerformanceTracker } from "../_lib/performance.ts";

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
  middle_name: string | null;
  last_name: string;
  pronouns: string | null;
  bio: string | null;
  gender: "female" | "male" | "non_binary";
  ai_summary: string | null;
  areas_of_focus: string[];
  approaches: string[];
  similarity: number;
  ethnicity: string[];
  sexuality: string[];
  faith: string[];
  initial_price: string;
  subsequent_price: string;
  availability: string;
  languages: string[];
  profile_img_url: string | null;
  video_intro_link: string | null;
  clinic_profile_url: string | null;
  clinic_booking_url: string | null;
  therapist_email: string | null;
  therapist_phone: string | null;
  clinic_name: string;
  clinic_street: string;
  clinic_city: string;
  clinic_province: string;
  clinic_postal_code: string;
  clinic_country: string;
  clinic_phone: string | null;
  education: string[];
  certifications: string[];
  licenses: {
    id: string;
    license_number: string;
    state: string;
    title: string;
    issuing_body: string | null;
    expiry_date: string | null;
    is_verified: boolean;
  }[];
  therapist_licenses?: any[];
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

Deno.serve(async (req) => {
  const perf = createPerformanceTracker("therapist-matches");

  try {
    // Handle CORS preflight request
    if (req.method === "OPTIONS") {
      console.log("[therapist-matches] CORS preflight request received");
      return new Response("ok", { headers: corsHeaders, status: 200 });
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: authorization ? { headers: { authorization } } : {},
      auth: { persistSession: false },
    });

    const {
      currentFilters,
      messages = [],
      lastUserMessage,
      filterOnly = false,
      triggerSource,
    } = await req.json();

    console.log("[therapist-matches] Request received from", { triggerSource });
    console.log("[therapist-matches]", { currentFilters });

    // -------------------------
    // HANDLE FILTER-ONLY REQUESTS
    // -------------------------
    if (filterOnly === true) {
      console.log("[therapist-matches] User requested filters only", {
        filterOnly,
      });

      // Check if we have any active filters
      const hasActiveFilters = Object.values(currentFilters || {}).some(
        (v) => v !== null && (Array.isArray(v) ? v.length > 0 : true)
      );

      if (!hasActiveFilters) {
        console.log(
          "[therapist-matches] No active filters, returning empty result"
        );
        return new Response(
          JSON.stringify({
            therapists: [],
            extractedFilters: currentFilters,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Build the query with proper joins for price filters
      const hasPriceFilter =
        currentFilters?.max_price_initial ||
        currentFilters?.max_price_subsequent;

      let query = supabase.from("therapists").select(`
        id,
        first_name,
        middle_name,
        last_name,
        pronouns,
        bio,
        gender,
        ethnicity,
        sexuality,
        faith,
        availability,
        languages,
        areas_of_focus,
        approaches,
        ai_summary,
        profile_img_url,
        video_intro_link,
        clinic_profile_url,
        clinic_booking_url,
        therapist_email,
        therapist_phone,
        clinic_name,
        clinic_street,
        clinic_city,
        clinic_province,
        clinic_postal_code,
        clinic_country,
        clinic_phone,
        education,
        certifications,
        therapist_fees!inner(session_category, session_type, price, currency, delivery_method, duration_minutes),
        therapist_licenses(*)
      `);

      // Apply all filters from the currentFilters object
      if (currentFilters?.gender) {
        query = query.eq("gender", currentFilters.gender);
      }

      if (currentFilters?.ethnicity && currentFilters.ethnicity.length > 0) {
        query = query.overlaps("ethnicity", currentFilters.ethnicity);
      }

      if (currentFilters?.sexuality && currentFilters.sexuality.length > 0) {
        query = query.overlaps("sexuality", currentFilters.sexuality);
      }

      if (currentFilters?.faith && currentFilters.faith.length > 0) {
        query = query.overlaps("faith", currentFilters.faith);
      }

      if (currentFilters?.availability) {
        query = query.eq("availability", currentFilters.availability);
      }

      // Handle price filters with proper session category filtering
      if (currentFilters?.max_price_initial) {
        query = query
          .lte("therapist_fees.price", currentFilters.max_price_initial)
          .eq("therapist_fees.session_category", "initial");
      }

      if (currentFilters?.max_price_subsequent) {
        query = query
          .lte("therapist_fees.price", currentFilters.max_price_subsequent)
          .eq("therapist_fees.session_category", "subsequent");
      }

      // Execute the query with performance tracking
      perf.startEvent("database:filterQuery");
      const { data: therapists, error } = await query.limit(10);

      if (error) {
        perf.endEvent("database:filterQuery", {
          error: error.message,
        });
        console.error("[therapist-matches] Database query error:", error);
        throw new Error(`Database query error: ${error.message}`);
      }

      perf.endEvent("database:filterQuery", {
        resultCount: therapists.length,
      });

      if (therapists.length === 0) {
        console.log("[therapist-matches] No therapists found by filters");
        return new Response(
          JSON.stringify({ therapists: [], extractedFilters: currentFilters }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Format the therapists to include price information
      const formattedTherapists = therapists.map(
        ({ therapist_fees, therapist_licenses, ...t }: any) => {
          return {
            ...t,
            fees: therapist_fees ? therapist_fees.map(fee => ({
              session_type: fee.session_type,
              session_category: fee.session_category,
              delivery_method: fee.delivery_method,
              duration_minutes: fee.duration_minutes,
              price: fee.price,
              currency: fee.currency
            })) : [],
            initial_price: therapist_fees?.find(
              (f) => f.session_category === "initial"
            )?.price,
            subsequent_price: therapist_fees?.find(
              (f) => f.session_category === "subsequent"
            )?.price,
            licenses: therapist_licenses || [],
          };
        }
      );

      return new Response(
        JSON.stringify({
          therapists: formattedTherapists || [],
          extractedFilters: currentFilters,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------
    // CHAT-BASED MATCHING WITH EMBEDDINGS
    // -------------------------
    console.log(
      "[therapist-matches] Processing chat-based request with embeddings"
    );

    // Check if we have a message to process
    const userMessage = lastUserMessage || "";

    if (!userMessage) {
      console.log(
        "[therapist-matches] No user message found for embedding generation"
      );
      return new Response(
        JSON.stringify({
          therapists: [],
          error: "No user message provided for matching",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    // Process with embeddings
    console.log("[therapist-matches] Creating embedding for:", userMessage);

    const embeddingResult = await generateEmbedding(userMessage);
    const embedding = embeddingResult.pgVector;
    console.log("[therapist-matches] Successfully generated embedding");

    // Define isFirstMessage more reliably - if there are therapists shown, it's not first message
    const isFirstMessage = messages.length === 0;
    console.log(`[therapist-matches]: isFirstMessage ${isFirstMessage}`);

    const isUserAskingForTherapist = await determineUserMessageIntent(
      userMessage,
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
      // Run Query Builder with current filters context
      console.log("running query builder");

      const params = await determineMatchTherapistParameters(
        userMessage,
        currentFilters,
        triggerSource
      );

      // Pass the queries to DB function, now with embedding
      console.log("params", params);

      // DB: Get Therapists - now with embedding parameter
      perf.startEvent("database:semanticSearch");
      const { data: therapists, error: matchError } = await supabase
        .rpc("match_therapists", {
          query_embedding: embedding,
          match_threshold: 0.1,
          gender_filter: params.gender_filter,
          sexuality_filter: params.sexuality_filter,
          ethnicity_filter: params.ethnicity_filter,
          faith_filter: params.faith_filter,
          max_price_initial:
            params.max_price_initial > 0 ? params.max_price_initial : null,
          availability_filter: params.availability_filter,
        })
        .limit(10);
      console.log(therapists, matchError);
      console.log("ethnciity", therapists[0]?.ethnicity);

      console.log(`Found ${therapists?.length} therapists`);

      if (matchError) {
        perf.endEvent("database:semanticSearch", { error: matchError.message });
        console.error("Error fetching therapists:", matchError);
        return new Response(
          JSON.stringify({
            error:
              "There was an error reading your therapists, please try again.",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      perf.endEvent("database:semanticSearch", {
        resultCount: therapists?.length,
      });

      console.log("[therapist-matches] First therapist sample data:", {
        id: therapists?.[0]?.id,
        name: `${therapists?.[0]?.first_name} ${therapists?.[0]?.last_name}`,
        profile_img_url: therapists?.[0]?.profile_img_url,
        video_intro_link: therapists?.[0]?.video_intro_link,
      });

      // Create response with therapists and current filters
      const extractedFilters = {
        gender: params.gender_filter,
        sexuality: params.sexuality_filter,
        ethnicity: params.ethnicity_filter,
        faith: params.faith_filter,
        max_price_initial: params.max_price_initial,
        availability: params.availability_filter,
      };

      const response = {
        therapists:
          therapists?.map((t: TherapistMatch) => ({
            id: t.id,
            first_name: t.first_name,
            middle_name: t.middle_name,
            last_name: t.last_name,
            pronouns: t.pronouns,
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
            bio: t.bio,
            profile_img_url: t.profile_img_url,
            video_intro_link: t.video_intro_link,
            clinic_profile_url: t.clinic_profile_url,
            clinic_booking_url: t.clinic_booking_url,
            therapist_email: t.therapist_email,
            therapist_phone: t.therapist_phone,
            clinic_name: t.clinic_name,
            clinic_street: t.clinic_street,
            clinic_city: t.clinic_city,
            clinic_province: t.clinic_province,
            clinic_postal_code: t.clinic_postal_code,
            clinic_country: t.clinic_country,
            clinic_phone: t.clinic_phone,
            education: t.education,
            certifications: t.certifications,
            licenses: t.therapist_licenses || [],
          })) || [],
        filters: {
          gender: params.gender_filter || null,
          sexuality: params.sexuality_filter || null,
          ethnicity: params.ethnicity_filter || null,
          faith: params.faith_filter || null,
          max_price_initial: params.max_price_initial || null,
          availability: params.availability_filter || null,
        },
        context: {
          triggerSource,
          filterReasoning: params.reasoning,
          isFirstMessage,
          userIntent: isUserAskingForTherapist.explanation,
        },
        extractedFilters: extractedFilters,
      };

      if (therapists && therapists.length > 0) {
        console.log(
          "[therapist-matches] Response sample - first therapist fields:",
          Object.keys(therapists[0])
        );
        console.log(
          "[therapist-matches] First therapist profile_img_url:",
          therapists[0].profile_img_url
        );
      }

      perf.complete();
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      perf.complete();
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
    console.error(`[therapist-matches] Error: ${error.message}`);
    perf.complete();
    return new Response(
      JSON.stringify({
        error: error.message,
        therapists: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
const determineUserMessageIntent = async (
  userMessage: string,
  context: DetermineUserMessageIntentContext
): Promise<DetermineUserMessageIntentResponse> => {
  const perf = createPerformanceTracker("intent-detection");

  /**
   * Use an LLM to determine if the user is asking a question or requesting a therapist.
   */

  const formattedMessage = [
    {
      role: "system",
      content: `You are analyzing user messages in a therapy matching platform. Your goal is to identify when users are expressing preferences for therapists.
  
  ${
    context.currentTherapists && context.currentTherapists.length > 0
      ? `
  The user is currently viewing these therapists:
  ${context.currentTherapists
    .map((t) => `- ${t.first_name} ${t.last_name}`)
    .join("\n")}
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
  
  Consider a message as a therapist request if it mentions any subtle hints about the following:
  - demographic preferences (gender, ethnicity, age, etc.)
  - therapy style or approach preferences
  - availability or location preferences
  - price/cost preferences
  - Questions about specific types of therapists
  - Any indication they're looking for or want to find a therapist
  - specific issues they want help with
  
  
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
      content: userMessage,
    },
  ];

  console.log(
    `[determineUserMessageIntent]: Analyzing message: "${userMessage}"`
  );

  const ClassifyUserIntent = z.object({
    isTherapistRequest: z.boolean(),
    explanation: z.string(),
  });

  perf.startEvent("llm:intentAnalysis");
  try {
    console.log("[determineUserMessageIntent]: Calling OpenAI API");
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: formattedMessage,
      response_format: zodResponseFormat(ClassifyUserIntent, "answer"),
    });

    console.log("[determineUserMessageIntent]: Received response from OpenAI");
    console.log(
      "[determineUserMessageIntent]: Parsed response:",
      JSON.stringify(completion.choices[0].message.parsed)
    );

    perf.endEvent("llm:intentAnalysis", {
      model: "gpt-4o-mini",
      messageLength: userMessage.length,
      isFirstMessage: context.isFirstMessage,
      isTherapistRequest:
        completion.choices[0].message.parsed.isTherapistRequest,
    });
    perf.complete();

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("[determineUserMessageIntent] Error:", error);
    console.error(
      "[determineUserMessageIntent] Error details:",
      error.response?.data || error.message
    );
    perf.endEvent("llm:intentAnalysis", { error: error.message });
    perf.complete();

    // Provide a fallback response instead of throwing
    return {
      isTherapistRequest: true, // Default to true for user messages that look like therapist requests
      explanation:
        "Error in analysis, defaulting to therapist request based on message content",
    };
  }
};

const determineMatchTherapistParameters = async (
  userMessage: string,
  currentFilters?: {
    gender: string | null;
    sexuality: string[] | null;
    ethnicity: string[] | null;
    faith: string[] | null;
    max_price_initial: number | null;
    availability: string | null;
  },
  triggerSource: "CHAT" | "FORM" = "CHAT"
): Promise<z.infer<typeof FilterParams>> => {
  const perf = createPerformanceTracker("parameter-detection");

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

  // Log the user message for debugging
  console.log(
    `[determineMatchTherapistParameters] User message: "${userMessage}"`
  );

  const systemContent = `You are an expert at extracting therapist preferences from user messages.
Your task is to carefully analyze the message and identify ANY mentions of therapist preferences.

Please extract the following if mentioned:
- gender (female, male, non_binary)
- sexuality (straight, gay, lesbian, bisexual, queer, pansexual, asexual, questioning, prefer_not_to_say)
- ethnicity (asian, black, hispanic, indigenous, middle_eastern, pacific_islander, white, multiracial, prefer_not_to_say)
- faith (christian, jewish, muslim, hindu, buddhist, sikh, atheist, agnostic, spiritual, other, prefer_not_to_say)
- price limit as a maximum hourly rate number
- availability (online, in_person, both)

IMPORTANT: For price limits, set max_price_initial to NULL when no price preference is mentioned.
DO NOT set price to 0 as this will exclude all therapists. Only set a numeric price when the user specifically mentions a price limit.

Be attentive to both explicit and implicit preferences. For example:
- "looking for a female therapist" → gender_filter: "female"
- "I'd prefer someone who is LGBT friendly" → Consider sexuality filters
- "Need someone who understands Asian culture" → ethnicity_filter: ["asian"]
- "I can only afford $100 per hour" → max_price_initial: 100

${
  currentFilters && triggerSource === "FORM"
    ? `
Current active filters (HIGH PRIORITY - keep these unless explicitly changed):
${Object.entries(currentFilters)
  .filter(([_, value]) => value !== null)
  .map(
    ([key, value]) =>
      `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}
`
    : currentFilters && triggerSource === "CHAT"
    ? `Current form filters (LOW PRIORITY - only use if chat doesn't specify preferences):
${Object.entries(currentFilters)
  .filter(([_, value]) => value !== null)
  .map(
    ([key, value]) =>
      `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`
  )
  .join("\n")}

Prioritize any preferences mentioned in the chat over these form filters.
`
    : ""
}

Include reasoning for the extracted preferences and explain any ambiguity in the message.`;

  const formattedMessages = [
    {
      role: "system",
      content: systemContent,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  perf.startEvent("llm:parameterExtraction");
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: formattedMessages,
      response_format: zodResponseFormat(FilterParams, "filters"),
    });

    const result = completion.choices[0].message.parsed;

    perf.endEvent("llm:parameterExtraction", {
      model: "gpt-4o-mini",
      messageLength: userMessage.length,
      filterCount:
        Object.values(result).filter(
          (v) => v !== null && (Array.isArray(v) ? v.length > 0 : true)
        ).length - 1, // Subtract one to exclude reasoning which isn't a filter
    });
    perf.complete();

    console.log(
      `[determineMatchTherapistParameters] Completion: ${JSON.stringify(
        result
      )}`
    );

    // If FORM trigger, merge the AI results with current filters, prioritizing current filters
    if (triggerSource === "FORM" && currentFilters) {
      return {
        ...result,
        gender_filter: (currentFilters.gender as any) ?? result.gender_filter,
        sexuality_filter: currentFilters.sexuality ?? result.sexuality_filter,
        ethnicity_filter: currentFilters.ethnicity ?? result.ethnicity_filter,
        faith_filter: currentFilters.faith ?? result.faith_filter,
        max_price_initial:
          currentFilters.max_price_initial ?? result.max_price_initial,
        availability_filter:
          (currentFilters.availability as any) ?? result.availability_filter,
      };
    }

    return result;
  } catch (error) {
    console.error("[determineMatchTherapistParameters] Error:", error);
    perf.endEvent("llm:parameterExtraction", { error: error.message });
    perf.complete();
    throw error;
  }
};
