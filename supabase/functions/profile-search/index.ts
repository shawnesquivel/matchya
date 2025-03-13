// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

console.log("Profile Search: Ready to serve requests");

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

    console.log(`Using the SUPABASE URL: ${Deno.env.get("SUPABASE_URL")}`);

    const url = new URL(req.url);
    const searchName = url.searchParams.get("name");

    if (!searchName) {
      return new Response(
        JSON.stringify({
          error: "Missing name parameter",
          debug: { requestUrl: req.url },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    console.log(
      `[profile-search] Searching for therapist with name: ${searchName}`,
    );

    // Split the name into parts for more flexible searching
    const nameParts = searchName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    console.log(
      `[profile-search] Parsed name - First: "${firstName}", Last: "${lastName}"`,
    );

    // Build the query based on the available name parts
    let query = supabaseClient.from("therapists").select(`
        *,
        fees:therapist_fees(*),
        licenses:therapist_licenses(*)
      `);

    if (nameParts.length > 1) {
      // If we have first and last name, try to match both
      query = query.or(
        `first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%`,
      );
    } else {
      // If we just have one name, search in both first and last name
      query = query.or(
        `first_name.ilike.%${firstName}%,last_name.ilike.%${firstName}%`,
      );
    }

    // Execute the query
    const { data: therapistResults, error } = await query.limit(1);

    if (error) throw error;

    if (!therapistResults || therapistResults.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No therapist found with that name",
          debug: {
            searchedName: searchName,
            firstName,
            lastName,
            nameParts,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        },
      );
    }

    // Get the first match
    const therapist = therapistResults[0];

    console.log(
      `[profile-search] Found therapist: ${therapist.first_name} ${therapist.last_name}`,
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

      // Fees - raw data from database, we'll adapt frontend to work with this
      fees: therapistFees,
    };

    return new Response(
      JSON.stringify({
        data: transformedData,
        debug: {
          searchedName: searchName,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("[profile-search] Error:", error);

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

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/profile-search?name=John+Smith' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
