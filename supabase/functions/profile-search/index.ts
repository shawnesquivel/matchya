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
    const searchSlug = url.searchParams.get("slug");
    const partialSlug = url.searchParams.get("partialSlug");

    // Handle partial slug matching (when no UUID suffix is provided)
    if (partialSlug) {
      console.log(
        `[profile-search] Searching for therapist with partial slug: ${partialSlug}`,
      );

      // Look for slugs that start with the partial slug
      const { data: therapistResults, error } = await supabaseClient
        .from("therapists")
        .select(`
          *,
          fees:therapist_fees(*),
          licenses:therapist_licenses(*),
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
        .like("slug", `${partialSlug}%`)
        .limit(1);

      if (error) throw error;

      if (!therapistResults || therapistResults.length === 0) {
        // If not found, return suggestions with more flexible matching
        const { data: similarTherapists, error: similarError } =
          await supabaseClient
            .from("therapists")
            .select("id, first_name, last_name, slug")
            .like("slug", `%${partialSlug.split("-")[0]}%`)
            .limit(5);

        return new Response(
          JSON.stringify({
            error: "No therapist found with that partial slug",
            suggestions: similarTherapists || [],
            debug: {
              searchedPartialSlug: partialSlug,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          },
        );
      }

      // Found therapist by partial slug
      const therapist = therapistResults[0];
      console.log(
        `[profile-search] Found therapist by partial slug: ${therapist.first_name} ${therapist.last_name} (${therapist.slug})`,
      );

      // Transform data using the same logic as exact slug search
      const therapistTitle = therapist.licenses && therapist.licenses.length > 0
        ? therapist.licenses[0].title
        : "Therapist";

      const therapistFees = therapist.fees || [];
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
        slug: therapist.slug,

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

        // Availability
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

        // Fees - raw data from database, we'll adapt frontend to work with this
        fees: therapistFees,

        // Prompt answers
        prompts: processedPrompts,
      };

      return new Response(
        JSON.stringify({
          data: transformedData,
          debug: {
            searchedPartialSlug: partialSlug,
            matchedSlug: therapist.slug,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Prioritize slug-based search if provided
    if (searchSlug) {
      console.log(
        `[profile-search] Searching for therapist with slug: ${searchSlug}`,
      );

      // Exact slug match
      const { data: therapistResults, error } = await supabaseClient
        .from("therapists")
        .select(`
          *,
          fees:therapist_fees(*),
          licenses:therapist_licenses(*),
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
        .eq("slug", searchSlug)
        .limit(1);

      if (error) throw error;

      if (!therapistResults || therapistResults.length === 0) {
        // If not found by exact slug, find similar therapists for suggestions
        const { data: similarTherapists, error: similarError } =
          await supabaseClient
            .from("therapists")
            .select("id, first_name, last_name, slug")
            .like("slug", `%${searchSlug.split("-")[0]}%`)
            .limit(5);

        return new Response(
          JSON.stringify({
            error: "No therapist found with that slug",
            suggestions: similarTherapists || [],
            debug: {
              searchedSlug: searchSlug,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          },
        );
      }

      // Found therapist by slug
      const therapist = therapistResults[0];
      console.log(
        `[profile-search] Found therapist by slug: ${therapist.first_name} ${therapist.last_name}`,
      );

      // Rest of processing is identical to name-based search
      // Get the therapist's title from licenses if available
      const therapistTitle = therapist.licenses && therapist.licenses.length > 0
        ? therapist.licenses[0].title
        : "Therapist";

      // Process fees
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
        slug: therapist.slug, // Include the slug in the response

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

        // Availability
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

        // Fees - raw data from database, we'll adapt frontend to work with this
        fees: therapistFees,

        // Prompt answers
        prompts: processedPrompts,
      };

      return new Response(
        JSON.stringify({
          data: transformedData,
          debug: {
            searchedSlug: searchSlug,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Fall back to name-based search if no slug provided
    if (!searchName) {
      return new Response(
        JSON.stringify({
          error: "Missing name or slug parameter",
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
        licenses:therapist_licenses(*),
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
      slug: therapist.slug, // Include the slug in the response

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

      // Availability
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

      // Fees - raw data from database, we'll adapt frontend to work with this
      fees: therapistFees,

      // Prompt answers
      prompts: processedPrompts,
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
  } catch (error: any) {
    console.error("[profile-search] Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
        debug: {
          type: error.name || "UnknownErrorType",
          stack: error.stack || "No stack trace available",
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
