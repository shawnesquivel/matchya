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
const QUERY_LIMIT = 10;
type DetermineUserMessageIntentResponse = {
  isTherapistRequest: boolean;
  answer: string;
  explanation: string;
};

type DetermineUserMessageIntentContext = {
  isFirstMessage: boolean;
  currentTherapists?: {
    id: string;
    first_name: string;
    last_name: string;
  }[];
  isFollowUp?: boolean;
};
interface TherapistFee {
  session_type: string;
  session_category: string;
  delivery_method: string;
  duration_minutes: number;
  price: number;
  currency: string;
}
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
  fees: TherapistFee[];
  licenses: {
    id: string;
    license_number: string;
    state: string;
    title: string;
    issuing_body: string | null;
    expiry_date: string | null;
    is_verified: boolean;
  }[];
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
        },
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
      isFollowUp = false,
    } = await req.json();

    // -------------------------
    // HANDLE FILTER-ONLY REQUESTS
    // -------------------------
    if (filterOnly === true) {
      console.log("[therapist-matches] User requested filters only", {
        filterOnly,
      });

      // Check if we have any active filters
      const hasActiveFilters = Object.values(currentFilters || {}).some(
        (v) => v !== null && (Array.isArray(v) ? v.length > 0 : true),
      );

      if (!hasActiveFilters) {
        console.log(
          "[therapist-matches] No active filters, returning empty result",
        );
        return new Response(
          JSON.stringify({
            therapists: [],
            extractedFilters: currentFilters,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      let query = supabase.from("therapists").select(`
        id,
        first_name,
        middle_name,
        last_name,
        pronouns::text,
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
        // Update the availability filter to also match "both" when a specific method is selected
        if (
          currentFilters.availability === "online" ||
          currentFilters.availability === "in_person"
        ) {
          query = query.or(
            `availability.eq.${currentFilters.availability},availability.eq.both`,
          );
        } else {
          query = query.eq("availability", currentFilters.availability);
        }
      }

      // Handle areas of focus filter - this needs to be custom SQL since we're using soft matching
      if (
        currentFilters?.areas_of_focus &&
        currentFilters.areas_of_focus.length > 0
      ) {
        // Convert filter terms to uppercase for case-insensitive matching
        // Note: PostgreSQL array operators are case-sensitive
        const capitalizedAreas = currentFilters.areas_of_focus.map((
          area: string,
        ) => area.charAt(0).toUpperCase() + area.slice(1));

        console.log(
          "[therapist-matches] Using capitalized areas:",
          capitalizedAreas,
        );

        // Use array overlap with properly capitalized terms
        query = query.overlaps("areas_of_focus", capitalizedAreas);
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

      // Add location filtering - handle the city and province from the welcome page
      if (currentFilters?.clinic_city && currentFilters?.clinic_province) {
        console.log(
          `[therapist-matches] Filtering by city: ${currentFilters.clinic_city}, province: ${currentFilters.clinic_province}`,
        );
        // Apply city and province filters directly to the matching columns
        query = query
          .eq("clinic_city", currentFilters.clinic_city)
          .eq("clinic_province", currentFilters.clinic_province);
      } else if (currentFilters?.clinic_city) {
        // If only city is provided, filter by city
        console.log(
          `[therapist-matches] Filtering by city only: ${currentFilters.clinic_city}`,
        );
        query = query.eq("clinic_city", currentFilters.clinic_city);
      } else if (currentFilters?.clinic_province) {
        // If only province is provided, filter by province
        console.log(
          `[therapist-matches] Filtering by province only: ${currentFilters.clinic_province}`,
        );
        query = query.eq("clinic_province", currentFilters.clinic_province);
      }

      // Execute the query with performance tracking
      perf.startEvent("database:filterQuery");
      const { data: therapists, error } = await query.limit(QUERY_LIMIT);

      // Debug logging to help identify issues
      console.log("[therapist-matches] Query completed");
      if (error) {
        perf.endEvent("database:filterQuery", {
          error: error.message,
        });
        console.error("[therapist-matches] Query error:", error);
        return new Response(
          JSON.stringify({
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            query: "SELECT from therapists with filters", // Simple query description
            filters: currentFilters || {},
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      perf.endEvent("database:filterQuery", {
        resultCount: therapists?.length || 0,
      });

      // Safely check therapists exists before logging
      console.log(
        `[therapist-matches] Found ${therapists?.length || 0} therapists`,
      );
      if (therapists && therapists.length > 0) {
        console.log("[therapist-matches] First therapist sample:", {
          id: therapists[0].id,
          name: `${therapists[0].first_name} ${therapists[0].last_name}`,
          pronouns: therapists[0].pronouns,
          pronouns_type: typeof therapists[0].pronouns,
        });
      } else {
        console.log(
          "[therapist-matches] No therapists data returned or empty array",
        );
      }

      if (!therapists || therapists.length === 0) {
        console.log("[therapist-matches] No therapists found by filters");
        return new Response(
          JSON.stringify({
            therapists: [],
            extractedFilters: currentFilters,
            filters_applied: JSON.stringify(currentFilters || {}),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Format the therapists to include price information
      console.log("[therapist-matches] Beginning to format therapists");

      // Safe check that therapists is an array before mapping
      if (!Array.isArray(therapists)) {
        console.error(
          "[therapist-matches] therapists is not an array:",
          therapists,
        );
        return new Response(
          JSON.stringify({
            error: "Therapists data is not an array",
            therapists: [],
            extractedFilters: currentFilters,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Add some debugging information before mapping
      therapists.forEach((therapist, index) => {
        if (therapist) {
          console.log(`[therapist-matches] Therapist ${index} info:`, {
            id: therapist.id,
            has_fees: Array.isArray(therapist.therapist_fees),
            has_licenses: Array.isArray(therapist.therapist_licenses),
          });
        } else {
          console.log(
            `[therapist-matches] Therapist ${index} is null or undefined`,
          );
        }
      });

      const formattedTherapists = therapists.map(
        ({ fees, licenses, ...t }: TherapistMatch) => {
          return {
            ...t,
            fees: Array.isArray(fees)
              ? fees.map((fee: TherapistFee) => ({
                session_type: fee.session_type,
                session_category: fee.session_category,
                delivery_method: fee.delivery_method,
                duration_minutes: fee.duration_minutes,
                price: fee.price,
                currency: fee.currency,
              }))
              : [],
            initial_price: Array.isArray(fees)
              ? fees.find(
                (f: TherapistFee) => f.session_category === "initial",
              )?.price
              : null,
            subsequent_price: Array.isArray(fees)
              ? fees.find(
                (f: TherapistFee) => f.session_category === "subsequent",
              )?.price
              : null,
            licenses: Array.isArray(licenses) ? licenses : [],
          };
        },
      );

      console.log(
        `[therapist-matches] Successfully formatted ${formattedTherapists.length} therapists`,
      );

      console.log(formattedTherapists[0]);

      return new Response(
        JSON.stringify({
          therapists: formattedTherapists,
          extractedFilters: currentFilters,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // -------------------------
    // CHAT-BASED MATCHING WITH EMBEDDINGS
    // -------------------------
    console.log(
      "[therapist-matches] Processing chat-based request with embeddings",
    );

    // Check if we have a message to process
    const userMessage = lastUserMessage || "";

    if (!userMessage) {
      console.log(
        "[therapist-matches] No user message found for embedding generation",
      );
      return new Response(
        JSON.stringify({
          therapists: [],
          error: "No user message provided for matching",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
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

    // If this is a follow-up question, assume it's not asking for therapists
    // unless it clearly is (e.g., "Can you show me more therapists?")
    let isUserAskingForTherapist;

    if (isFollowUp) {
      console.log("[therapist-matches]: Processing as follow-up question");

      // For follow-up questions, we'll still check intent but with a higher threshold
      isUserAskingForTherapist = await determineUserMessageIntent(
        userMessage,
        {
          isFirstMessage,
          currentTherapists: messages.map((
            m: { id: string; first_name: string; last_name: string },
          ) => ({
            id: m.id,
            first_name: m.first_name,
            last_name: m.last_name,
          })),
          isFollowUp: true, // Add this flag
        },
      );

      console.log(
        "[therapist-matches]: Follow-up question intent:",
        isUserAskingForTherapist,
      );
    } else {
      // Process normal messages as before
      isUserAskingForTherapist = await determineUserMessageIntent(
        userMessage,
        {
          isFirstMessage,
          currentTherapists: messages.map((
            m: { id: string; first_name: string; last_name: string },
          ) => ({
            id: m.id,
            first_name: m.first_name,
            last_name: m.last_name,
          })),
        },
      );
    }

    console.log(
      { isUserAskingForTherapist },
    );

    if (isUserAskingForTherapist.isTherapistRequest) {
      const params = await determineMatchTherapistParameters(
        userMessage,
        currentFilters,
        triggerSource,
      );

      const effectiveMaxPrice = params.max_price_initial === 0
        ? null
        : (params.max_price_initial && params.max_price_initial > 0
          ? params.max_price_initial
          : null);

      perf.startEvent("database:semanticSearch");

      const { data: therapists, error: matchError } = await supabase
        .rpc("match_therapists", {
          query_embedding: embedding,
          match_threshold: 0,
          gender_filter: params.gender_filter,
          sexuality_filter: params.sexuality_filter,
          ethnicity_filter: params.ethnicity_filter,
          faith_filter: params.faith_filter,
          max_price_initial: effectiveMaxPrice,
          availability_filter: params.availability_filter,
          areas_of_focus_filter: params.areas_of_focus_filter,
          clinic_city_param: currentFilters?.clinic_city || null,
          clinic_province_param: currentFilters?.clinic_province || null,
        })
        .limit(QUERY_LIMIT);

      // Detailed filter parameter logging
      const searchCriteriaDetails = {
        ...(params.ethnicity_filter &&
          { ethnicity_filter: params.ethnicity_filter }),
        ...(params.gender_filter && { gender_filter: params.gender_filter }),
        ...(params.sexuality_filter &&
          { sexuality_filter: params.sexuality_filter }),
        ...(params.faith_filter && { faith_filter: params.faith_filter }),
        ...(params.max_price_initial > 0 &&
          { max_price_initial: params.max_price_initial }),
        ...(params.availability_filter &&
          { availability_filter: params.availability_filter }),
        ...(params.areas_of_focus_filter &&
          { areas_of_focus_filter: params.areas_of_focus_filter }),
      };

      console.log(
        "[therapist-matches]: searchCriteriaDetails",
        searchCriteriaDetails,
      );

      console.log(
        therapists?.map((t: TherapistMatch) =>
          `${t.first_name} ${t.last_name}`
        ),
      );

      console.log(`Found ${therapists?.length || 0} therapists`);

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
          },
        );
      }
      perf.endEvent("database:semanticSearch", {
        resultCount: therapists?.length,
      });

      // Create response with therapists and current filters
      const extractedFilters = {
        gender: params.gender_filter,
        sexuality: params.sexuality_filter,
        ethnicity: params.ethnicity_filter,
        faith: params.faith_filter,
        max_price_initial: params.max_price_initial,
        availability: params.availability_filter,
        areas_of_focus: params.areas_of_focus_filter,
        clinic_city: currentFilters?.clinic_city,
        clinic_province: currentFilters?.clinic_province,
      };

      const response = {
        therapists: therapists?.map((t: TherapistMatch) => ({
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
          licenses: t.licenses || [],
        })) || [],
        filters: {
          gender: params.gender_filter || null,
          sexuality: params.sexuality_filter || null,
          ethnicity: params.ethnicity_filter || null,
          faith: params.faith_filter || null,
          max_price_initial: params.max_price_initial || null,
          availability: params.availability_filter || null,
          areas_of_focus: params.areas_of_focus_filter || null,
          clinic_city: currentFilters?.clinic_city || null,
          clinic_province: currentFilters?.clinic_province || null,
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
          Object.keys(therapists[0]),
        );
        console.log(
          "[therapist-matches] First therapist profile_img_url:",
          therapists[0].profile_img_url,
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
            areas_of_focus: null,
            clinic_city: null,
            clinic_province: null,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error: unknown) {
    console.error(
      `[therapist-matches] Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    perf.complete();
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        therapists: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
const determineUserMessageIntent = async (
  userMessage: string,
  context: DetermineUserMessageIntentContext,
): Promise<DetermineUserMessageIntentResponse> => {
  const perf = createPerformanceTracker("intent-detection");

  /**
   * Use an LLM to determine if the user is asking a question or requesting a therapist.
   */

  const formattedMessage = [
    {
      role: "system",
      content:
        `You are a receptionist. Your goal is to identify when users are expressing preferences for therapists or just chatting.
  ${
          context.currentTherapists && context.currentTherapists.length > 0
            ? `
  The user is currently viewing these therapists:
  ${
              context.currentTherapists
                .map((t) => `- ${t.first_name} ${t.last_name}`)
                .join("\n")
            }
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
  
  ${
          context.isFollowUp
            ? `
  IMPORTANT: This message is a follow-up question after being shown therapists. 
  For follow-up questions, only classify as a therapist request if they are SPECIFICALLY:
  - Asking for different therapists
  - Adding new criteria for therapists
  - Explicitly asking to see more options
  
  Otherwise, treat it as a general question about therapy or the existing therapists.
  `
            : ""
        }
  
  Consider a message as a therapist request if it mentions any subtle hints about the following:
  - demographic preferences (gender, ethnicity, age, etc.)
  - therapy style or approach preferences
  - availability or location preferences
  - price/cost preferences
  - Questions about specific types of therapists
  - specific issues they're struggling with
  
  
  Example therapist requests could be vague or incomplete sentences.
  - "prefer pacific islanders"
  - "looking for someone under $150"
  - "need help with anxiety"
  - "are there any female therapists?"
  - "someone who does CBT"
  - "available on weekends"
  
  Only classify as NOT a therapist request if the message is:
  - A general question about therapy concepts (e.g. "What is CBT?")
  - Small talk or greetings
  - Direct questions about the platform/service
  
  Don't pre-amble, just extract preferences concisely.
  `,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  console.log(
    `[determineUserMessageIntent]`,
    { userMessage, isFollowUp: context.isFollowUp || false },
  );

  const ClassifyUserIntent = z.object({
    isTherapistRequest: z.boolean(),
    explanation: z.string(),
  });

  perf.startEvent("llm:intentAnalysis");
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: formattedMessage,
      response_format: zodResponseFormat(ClassifyUserIntent, "answer"),
    });

    perf.endEvent("llm:intentAnalysis", {
      model: "gpt-4o-mini",
      messageLength: userMessage.length,
      isFirstMessage: context.isFirstMessage,
      isFollowUp: context.isFollowUp || false,
      isTherapistRequest:
        completion.choices[0].message.parsed.isTherapistRequest,
    });
    perf.complete();

    return completion.choices[0].message.parsed;
  } catch (error: unknown) {
    console.error("[determineUserMessageIntent] Error:", error);
    console.error(
      "[determineUserMessageIntent] Error details:",
      error instanceof Error ? error.message : String(error),
    );
    perf.endEvent("llm:intentAnalysis", {
      error: error instanceof Error ? error.message : String(error),
    });
    perf.complete();
    return {
      isTherapistRequest: true,
      explanation:
        "Error in analysis, defaulting to therapist request based on message content",
      answer: "",
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
    areas_of_focus: string[] | null;
    clinic_city: string | null;
    clinic_province: string | null;
  },
  triggerSource: "CHAT" | "FORM" = "CHAT",
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
    areas_of_focus_filter: z.array(z.string()).nullable(),
    reasoning: z.string(),
  });

  const systemContent =
    `You are an expert at extracting therapist preferences from user messages.
Your task is to carefully analyze the message and identify ANY mentions of therapist preferences.

Please extract the following if mentioned:
- gender (female, male, non_binary)
- sexuality (straight, gay, lesbian, bisexual, queer, pansexual, asexual, questioning, prefer_not_to_say)
- ethnicity (asian, black, hispanic, indigenous, middle_eastern, pacific_islander, white, multiracial, prefer_not_to_say)
- faith (christian, jewish, muslim, hindu, buddhist, sikh, atheist, agnostic, spiritual, other, prefer_not_to_say)
- price limit as a maximum hourly rate number
- availability (online, in_person, both)
- areas of focus (anxiety, depression, trauma, relationships, addiction, grief, stress, self_esteem, family, anger, career, etc.)


${
      currentFilters && (triggerSource === "FORM" || triggerSource === "CHAT")
        ? `
Current active filters (HIGH PRIORITY - PRESERVE THESE unless explicitly changed):
${
          Object.entries(currentFilters)
            .filter(([key, value]) =>
              value !== null && !key.includes("clinic_")
            )
            .map(
              ([key, value]) =>
                `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
            )
            .join("\n")
        }

IMPORTANT: For CHAT mode, PRESERVE previous filters and ADD new ones mentioned. Only REPLACE a filter if the user explicitly changes that specific preference.
The location is already set by the user interface and is not part of this extraction.
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

    // Add clinic_city and clinic_province directly from currentFilters after extraction
    const resultWithLocation = {
      ...result,
      // Add location from UI directly, not from extraction
      clinic_city: currentFilters?.clinic_city || null,
      clinic_province: currentFilters?.clinic_province || null,
    };

    perf.endEvent("llm:parameterExtraction", {
      model: "gpt-4o-mini",
      messageLength: userMessage.length,
      filterCount: Object.values(resultWithLocation).filter(
        (v) => v !== null && (Array.isArray(v) ? v.length > 0 : true),
      ).length - 1, // Subtract one to exclude reasoning which isn't a filter
    });
    perf.complete();

    // For both FORM and CHAT trigger, merge the AI results with current filters
    // Only replace filters that are explicitly mentioned in the current message
    if (currentFilters) {
      // First, create a merged version preserving previous filters
      const mergedResult = {
        ...resultWithLocation,
        gender_filter: resultWithLocation.gender_filter !== null
          ? resultWithLocation.gender_filter
          : (currentFilters.gender as string),
        sexuality_filter: resultWithLocation.sexuality_filter !== null
          ? resultWithLocation.sexuality_filter
          : currentFilters.sexuality,
        ethnicity_filter: resultWithLocation.ethnicity_filter !== null
          ? resultWithLocation.ethnicity_filter
          : currentFilters.ethnicity,
        faith_filter: resultWithLocation.faith_filter !== null
          ? resultWithLocation.faith_filter
          : currentFilters.faith,
        max_price_initial: resultWithLocation.max_price_initial !== null
          ? resultWithLocation.max_price_initial
          : currentFilters.max_price_initial,
        availability_filter: resultWithLocation.availability_filter !== null
          ? resultWithLocation.availability_filter
          : (currentFilters.availability as string),
        areas_of_focus_filter: resultWithLocation.areas_of_focus_filter !== null
          ? resultWithLocation.areas_of_focus_filter
          : currentFilters.areas_of_focus,
        // Location always comes from the UI selection
        clinic_city: currentFilters.clinic_city,
        clinic_province: currentFilters.clinic_province,
      };

      // In FORM mode, give priority to form filters over chat message filters
      if (triggerSource === "FORM") {
        return {
          ...mergedResult,
          gender_filter: (currentFilters.gender as string) ??
            resultWithLocation.gender_filter,
          sexuality_filter: currentFilters.sexuality ??
            resultWithLocation.sexuality_filter,
          ethnicity_filter: currentFilters.ethnicity ??
            resultWithLocation.ethnicity_filter,
          faith_filter: currentFilters.faith ?? resultWithLocation.faith_filter,
          max_price_initial: currentFilters.max_price_initial ??
            resultWithLocation.max_price_initial,
          availability_filter: (currentFilters.availability as string) ??
            resultWithLocation.availability_filter,
          areas_of_focus_filter: currentFilters.areas_of_focus ??
            resultWithLocation.areas_of_focus_filter,
          // Location always comes from the UI
          clinic_city: currentFilters.clinic_city,
          clinic_province: currentFilters.clinic_province,
        };
      }

      return mergedResult;
    }

    return resultWithLocation;
  } catch (error: unknown) {
    console.error("[determineMatchTherapistParameters] Error:", error);
    perf.endEvent("llm:parameterExtraction", {
      error: error instanceof Error ? error.toString() : String(error),
    });
    perf.complete();
    throw error;
  }
};
