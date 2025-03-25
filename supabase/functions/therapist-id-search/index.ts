// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

console.log("Therapist ID Search: Ready to serve requests");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
        auth: { persistSession: false },
      },
    );

    const url = new URL(req.url);
    const therapistId = url.searchParams.get("id");

    if (!therapistId) {
      return new Response(
        JSON.stringify({
          error: "Missing id parameter",
          debug: { requestUrl: req.url },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log(
      `[therapist-id-search] Looking up therapist ID: ${therapistId}`,
    );

    // Execute exact ID match query
    const { data: therapistResults, error } = await supabaseClient
      .from("therapists")
      .select(`
        *,
        fees:therapist_fees(*),
        licenses:therapist_licenses(*),
        videos:therapist_videos(
          id,
          url,
          platform,
          type,
          title,
          description,
          display_order,
          is_active
        ),
        prompt_answers:therapist_prompts(
          id,
          answer,
          prompt_id,
          prompts:prompts(
            id,
            question,
            category:prompt_categories(
              id,
              name,
              display_name
            )
          )
        )
      `)
      .eq("id", therapistId)
      .limit(1);

    if (error) throw error;

    if (!therapistResults || therapistResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No therapist found with that ID",
          debug: { searchedId: therapistId },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        },
      );
    }

    // Get the exact match
    const therapist = therapistResults[0];

    console.log(
      `[therapist-id-search] Found therapist: ${therapist.first_name} ${therapist.last_name}`,
    );

    // Get the therapist's title from licenses if available
    const therapistTitle = therapist.licenses && therapist.licenses.length > 0
      ? therapist.licenses[0].title
      : "Therapist";

    // Process fees - no longer mapping to old structure since we're adapting the frontend
    const therapistFees = therapist.fees || [];

    // Transform the Supabase record to match the expected format
    const therapistName = `${therapist.first_name || ""} ${
      therapist.last_name || ""
    }`.trim();

    // Process prompt answers
    const promptAnswers = therapist.prompt_answers || [];
    const processedPrompts = promptAnswers.map((answer: any) => ({
      id: answer.id,
      prompt_id: answer.prompt_id,
      question: answer.prompts?.question || "",
      answer: answer.answer || "",
      category_name: answer.prompts?.category?.name || "",
      category_display_name: answer.prompts?.category?.display_name || "",
    }));

    const transformedData = {
      // Basic info
      id: therapist.id,
      name: therapistName,
      first_name: therapist.first_name,
      last_name: therapist.last_name,
      title: therapistTitle,

      // Contact & identity
      gender: therapist.gender,
      pronouns: therapist.pronouns,
      sexuality: therapist.sexuality,
      ethnicity: therapist.ethnicity,
      faith: therapist.faith,

      // Profile
      bio: therapist.bio || "",
      ai_summary: therapist.ai_summary || "",
      profile_img_url: therapist.profile_img_url,
      video_intro_link: therapist.video_intro_link,

      // Availability & Status
      is_accepting_clients: therapist.is_accepting_clients,

      // Location
      clinic_name: therapist.clinic_name || "",
      clinic_city: therapist.clinic_city || "",
      clinic_province: therapist.clinic_province || "",
      clinic_country: therapist.clinic_country || "",

      // Contact
      clinic_profile_url: therapist.clinic_profile_url,
      clinic_booking_url: therapist.clinic_booking_url,

      // Professional details
      availability: therapist.availability,
      languages: therapist.languages || [],
      education: therapist.education || [],
      certifications: therapist.certifications || [],
      areas_of_focus: therapist.areas_of_focus || [],
      approaches: therapist.approaches || {},

      // Licenses
      licenses: therapist.licenses || [],

      // Fees - raw data from database
      fees: therapistFees,

      // Videos
      videos: therapist.videos || [],

      // Prompt answers
      prompts: processedPrompts,
    };

    return new Response(
      JSON.stringify({
        data: transformedData,
        debug: {
          searchedId: therapistId,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("[therapist-id-search] Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        debug: {
          type: error.name,
          stack: error.stack,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/therapist-id-search?id=06e72e68-38ff-4fcd-8a6f-8630adca89d4' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json'

*/
