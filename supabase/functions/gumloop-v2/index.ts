// deno-lint-ignore-file no-explicit-any
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "@supabase/supabase-js";
import { createClient } from "jsr:@supabase/supabase-js";

console.log("Gumloop webhook handler started!");

interface TherapistData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  pronouns?: string;
  gender: "female" | "male" | "non_binary";
  sexuality?: string[];
  ethnicity?: string[];
  faith?: string[];

  // Profile & Links
  profile_img_url?: string;
  video_intro_link?: string;
  ai_summary?: string;
  clinic_profile_url?: string;
  clinic_booking_url?: string;

  // Contact & Location
  therapist_email?: string;
  therapist_phone?: string;
  clinic_name: string;
  clinic_street: string;
  clinic_city: string;
  clinic_postal_code?: string;
  clinic_province: string;
  clinic_country: string;
  clinic_phone?: string;

  // Availability
  availability: "online" | "in_person" | "both";

  // Professional Details
  education?: string[];
  certifications?: string[];
  approaches?: string[];
  areas_of_focus?: string[];
  languages?: string[];
  bio?: string;
}

interface TherapistFee {
  session_category: string;
  session_type: string;
  delivery_method: "in_person" | "virtual" | "hybrid";
  duration_minutes: number;
  price: number;
  currency: string; // 3-letter currency code
}

interface TherapistLicense {
  license_number: string;
  state: string; // jurisdiction_type enum
  title: string; // license_title_type enum
  issuing_body?: string;
  expiry_date?: string; // ISO date string
}

//  Warning:
// When modifying these, check the definition in the migrations/create_therapists_table.sql
// Also check the recommended types in Gumloop S1.
const VALID_SEXUALITY_TYPES = [
  "straight",
  "gay",
  "lesbian",
  "bisexual",
  "queer",
  "pansexual",
  "asexual",
  "questioning",
  "prefer_not_to_say",
];

const VALID_ETHNICITY_TYPES = [
  "asian",
  "black",
  "hispanic",
  "indigenous",
  "middle_eastern",
  "pacific_islander",
  "white",
  "multiracial",
  "prefer_not_to_say",
];

const VALID_FAITH_TYPES = [
  "agnostic",
  "atheist",
  "buddhist",
  "christian",
  "hindu",
  "jewish",
  "muslim",
  "sikh",
  "spiritual",
  "other",
  "prefer_not_to_say",
];

const VALID_PRONOUNS_TYPES = [
  "she/her",
  "she/they",
  "he/him",
  "he/they",
  "they/them",
  "ze/zir",
  "prefer_not_to_say",
];

const VALID_SESSION_CATEGORIES = [
  "initial",
  "consultation",
  "subsequent",
];

const VALID_SESSION_TYPES = [
  "individual",
  "couples",
  "family",
  "group",
  "psychedelic_integration",
];

const VALID_DELIVERY_METHODS = [
  "in_person",
  "virtual",
  "hybrid",
];

const VALID_JURISDICTIONS = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

const VALID_LICENSE_TITLES = [
  "CPsych",
  "MD",
  "NP",
  "RCC",
  "RN",
  "RP",
  "RSW",
  "MACP",
  "MSW",
  "CCC",
  "MC",
  "RTC",
  "MBA",
  "Practicum Student",
  "MA",
];

// Helper function to clean markdown formatting from strings
function cleanMarkdownFormatting(
  text: string | null | undefined,
): string | null {
  if (!text) return null;

  // Remove markdown code block notation and language identifier
  let cleanText = text.replace(/^```[\w]*\n/, "").replace(/\n```$/, "");

  // Remove any remaining backticks
  cleanText = cleanText.replace(/`/g, "");

  return cleanText;
}

// Parse YAML-like text into key-value pairs
function parseProfileText(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split("\n");

  let currentKey = "";

  for (const line of lines) {
    // Skip empty lines or section headers
    if (line.trim() === "" || line.startsWith("#")) {
      continue;
    }

    // Check if this is a key-value pair
    const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();

      // Handle array values
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          // Try to parse as JSON array
          result[currentKey] = JSON.parse(value);
        } catch (e) {
          // If JSON parsing fails, split by commas and trim
          result[currentKey] = value.slice(1, -1).split(",").map((s) =>
            s.trim()
          );
        }
      } else if (value === "null" || value === "") {
        result[currentKey] = null;
      } else {
        result[currentKey] = value;
      }
    }
  }

  return result;
}

// Parse fee strings into structured objects
function parseFees(feeStrings: string[]): TherapistFee[] {
  const fees: TherapistFee[] = [];

  for (const feeString of feeStrings) {
    // Skip empty strings
    if (!feeString || feeString.trim() === "") {
      console.warn("Skipping empty fee string");
      continue;
    }

    let feeObj: any;
    try {
      // Clean any markdown formatting from the string
      const cleanFeeString = cleanMarkdownFormatting(feeString) || feeString;

      // Try to parse the fee JSON
      try {
        feeObj = JSON.parse(cleanFeeString);
      } catch (e: unknown) {
        console.warn(`Failed to parse fee JSON: ${(e as Error).message}`);
        console.warn(`Problematic fee string: ${cleanFeeString}`);
        continue;
      }

      // Validate required fields
      if (
        !feeObj.session_category ||
        !feeObj.session_type ||
        !feeObj.delivery_method ||
        feeObj.duration_minutes === undefined ||
        feeObj.price === undefined
      ) {
        console.warn(
          `Fee missing required fields: ${JSON.stringify(feeObj)}`,
        );
        continue;
      }

      // Create the fee object
      const fee: TherapistFee = {
        session_category: String(feeObj.session_category),
        session_type: String(feeObj.session_type),
        delivery_method: String(feeObj.delivery_method) as
          | "in_person"
          | "virtual"
          | "hybrid",
        duration_minutes: Number(feeObj.duration_minutes),
        price: Number(feeObj.price),
        currency: feeObj.currency ? String(feeObj.currency) : "CAD",
      };

      // Add to the array
      fees.push(fee);
    } catch (error: unknown) {
      console.warn(
        `Error processing fee: ${(error as Error).message}. Fee data: ${
          JSON.stringify(feeObj || feeString)
        }`,
      );
    }
  }

  return fees;
}

// Function to ensure we have an array
function ensureArray(value: any): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    // If it's an array with a single string that might contain comma-separated values
    if (
      value.length === 1 && typeof value[0] === "string" &&
      value[0].includes(",")
    ) {
      // Split the single string by commas and trim each item
      return value[0].split(",").map((item) => item.trim()).filter(Boolean);
    }

    // If it's a regular array, make sure all elements are strings
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    // If it's a JSON array string
    if (value.startsWith("[") && value.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        // After parsing, check if we have an array with a single comma-separated string
        return ensureArray(parsed);
      } catch (e) {
        // If parsing fails, split by comma
        return value.slice(1, -1).split(",").map((s) => s.trim()).filter(
          Boolean,
        );
      }
    }

    // If it's a comma-separated string
    if (value.includes(",")) {
      return value.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // If it's a single value
    return [value.trim()].filter(Boolean);
  }

  return [];
}

// Function to validate arrays
// deno-lint-ignore no-explicit-any
function validateArray(data: any, key: string): string[] {
  if (!data[key]) return [];

  return ensureArray(data[key]);
}

// Validate and clean enum values
function validateEnumValue(
  value: string | null | undefined,
  validValues: string[],
  defaultValue: string | null = null,
): string | null {
  if (!value) return defaultValue;

  // Remove any quotes
  let cleanValue = String(value).replace(/^['"]+|['"]+$/g, "").trim()
    .toLowerCase();

  // Check if value is valid
  if (validValues.includes(cleanValue)) {
    return cleanValue;
  }

  // Try to convert spaces to underscores
  cleanValue = cleanValue.replace(/\s+/g, "_");
  if (validValues.includes(cleanValue)) {
    return cleanValue;
  }

  console.warn(
    `Invalid enum value: ${value}. Valid values are: ${validValues.join(", ")}`,
  );
  return defaultValue;
}

// Validate enum arrays (e.g., sexuality, ethnicity, faith)
function validateEnumArray(
  values: string[] | null | undefined,
  validValues: string[],
): string[] {
  if (!values || !Array.isArray(values)) return [];

  const result: string[] = [];
  for (const val of values) {
    const cleanVal = validateEnumValue(val, validValues);
    if (cleanVal) {
      result.push(cleanVal);
    }
  }

  return result;
}

// Create a supabase client
function createSupabaseClient() {
  // Create a Supabase client with the stored credentials
  const supabaseClient = createClient(
    // Supabase API URL - env var exported by default when deployed
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase API SERVICE ROLE KEY - env var exported by default when deployed
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  return supabaseClient;
}

// Cleans the URL fields to ensure they're properly formatted
function cleanUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Remove any markdown link syntax
  if (url.startsWith("[") && url.includes("](") && url.endsWith(")")) {
    // Extract URL part from markdown: [link text](url)
    const matches = url.match(/\[.*\]\((.*)\)/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
  }

  // Handle markdown image syntax
  if (url.startsWith("![") && url.includes("](") && url.endsWith(")")) {
    // Extract URL part from markdown: ![alt text](url)
    const matches = url.match(/!\[.*\]\((.*)\)/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
  }

  // Ensure URL has http:// or https://
  if (url && !url.match(/^https?:\/\//i) && !url.startsWith("mailto:")) {
    return `https://${url}`;
  }

  return url;
}

// Helper function to find closest match in a list of valid values
function findClosestMatch(value: string, validValues: string[]): string | null {
  if (!value) return null;

  // Convert to uppercase for comparison
  const upperValue = value.toUpperCase();

  // Direct match after uppercase conversion
  const directMatch = validValues.find((v) => v.toUpperCase() === upperValue);
  if (directMatch) return directMatch;

  // Check for substring matches
  for (const validValue of validValues) {
    if (
      upperValue.includes(validValue.toUpperCase()) ||
      validValue.toUpperCase().includes(upperValue)
    ) {
      return validValue;
    }
  }

  return null;
}

// Check if a therapist with the same name already exists
async function checkForExistingTherapist(
  supabase: any,
  firstName: string,
  lastName: string,
  logFn: (message: string) => void,
): Promise<{ exists: boolean; therapist?: any; error?: any }> {
  try {
    const { data: existingTherapists, error: searchError } = await supabase
      .from("therapists")
      .select("id, first_name, last_name")
      .eq("first_name", firstName)
      .eq("last_name", lastName)
      .limit(1);

    if (searchError) {
      logFn(
        `[ERROR] Error checking for existing therapist: ${searchError.message}`,
      );
      return { exists: false, error: searchError };
    }

    if (existingTherapists && existingTherapists.length > 0) {
      logFn(
        `[WARN] Therapist ${firstName} ${lastName} already exists with ID: ${
          existingTherapists[0].id
        }`,
      );
      return { exists: true, therapist: existingTherapists[0] };
    }

    return { exists: false };
  } catch (error) {
    logFn(
      `[ERROR] Unexpected error in duplicate check: ${
        (error as Error).message
      }`,
    );
    return { exists: false, error };
  }
}

Deno.serve(async (req) => {
  // Hardcoded Values
  const clinic_country = "CA";
  const clinic_province = "BC";
  const warnings: string[] = [];
  const logs: string[] = [];

  function log(message: string) {
    console.log(message);
    logs.push(message);
  }

  try {
    // Initialize the Supabase client
    const supabase = createSupabaseClient();

    // Check if request method is POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST requests are supported" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            Allow: "POST",
          },
        },
      );
    }

    // Get the raw text regardless of content type
    const textData = await req.text();

    // Parse the incoming JSON data
    let payload;
    try {
      payload = JSON.parse(textData);
      log(`Payload structure: ${Object.keys(payload).join(", ")}`);
    } catch (e: unknown) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: (e as Error).message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check payload structure and extract data accordingly
    let profileData: Record<string, any> = {};
    let fees: TherapistFee[] = [];
    const licenses: TherapistLicense[] = [];
    let profileImgUrl: string | null = null;
    let clinicProfileUrl: string | null = null;
    let clinicBookingUrl: string | null = null;

    // Handle the new payload structure with profile and fees
    if (payload.profile && typeof payload.profile === "string") {
      try {
        // Try to parse profile as JSON if it's a string that contains JSON
        const cleanProfile = cleanMarkdownFormatting(payload.profile) ||
          payload.profile;
        const parsedProfile = JSON.parse(cleanProfile);
        profileData = parsedProfile;
      } catch (e) {
        // If it's not JSON, try to parse it as YAML-like text
        profileData = parseProfileText(payload.profile);
      }
    } else if (
      typeof payload.profile === "object" && payload.profile !== null
    ) {
      profileData = payload.profile;
      log("Using profile object from payload");
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid payload structure",
          message: "Expected 'profile' field",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Extract profile image URL
    if (payload.profile_img_url) {
      profileImgUrl = cleanUrl(payload.profile_img_url);
    }

    // Extract clinic profile URL
    if (payload.clinic_profile_url) {
      clinicProfileUrl = cleanUrl(payload.clinic_profile_url);
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid payload structure",
          message: "Expected 'clinic_profile_url' field",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Extract clinic booking URL
    if (payload.clinic_booking_url) {
      clinicBookingUrl = cleanUrl(payload.clinic_booking_url);
    }

    // Extract fees
    if (payload.fees && Array.isArray(payload.fees)) {
      if (payload.fees.length === 0) {
        const warningMsg = "Fees field is provided but empty.";
        log(`Warning: ${warningMsg}`);
        warnings.push(warningMsg);
      } else {
        fees = parseFees(payload.fees);
        log(`Parsed ${fees.length} fee records`);
      }
    } else {
      const warningMsg = "Fees field is not provided or not an array.";
      log(`Warning: ${warningMsg}`);
      warnings.push(warningMsg);
    }

    // Extract and process licenses data
    if (payload.licenses && Array.isArray(payload.licenses)) {
      log(`Processing ${payload.licenses.length} licenses from payload`);

      for (const licenseItem of payload.licenses) {
        try {
          let parsedLicense: TherapistLicense;

          if (typeof licenseItem === "string") {
            // Clean any markdown formatting and parse
            const cleanLicense = cleanMarkdownFormatting(licenseItem);
            parsedLicense = JSON.parse(cleanLicense || licenseItem);
          } else if (typeof licenseItem === "object") {
            parsedLicense = licenseItem as TherapistLicense;
          } else {
            const errorMsg = `Invalid license data type: ${typeof licenseItem}`;
            log(`${errorMsg} - Value: ${JSON.stringify(licenseItem)}`);
            warnings.push(errorMsg);
            continue;
          }

          // Add default state if missing - typically BC for Canadian therapists
          if (!parsedLicense.state) {
            const warningMsg =
              `License missing required 'state' field, defaulting to 'BC'. License: ${
                JSON.stringify(parsedLicense)
              }`;
            log(`Warning: ${warningMsg}`);
            warnings.push(warningMsg);
            parsedLicense.state = "BC";
          }

          // Validate license fields after applying defaults
          if (!parsedLicense.license_number || !parsedLicense.title) {
            const errorMsg =
              "License missing other required fields (after state defaulting)";
            log(`${errorMsg} - License: ${JSON.stringify(parsedLicense)}`);
            warnings.push(errorMsg);
            continue;
          }

          // Process license data (remove # from license number if present)
          parsedLicense.license_number = String(parsedLicense.license_number)
            .replace(/^#/, "");

          // Check if license number has at least 5 digits
          const digitsOnly = parsedLicense.license_number.replace(/\D/g, "");
          if (digitsOnly.length < 3) {
            const DEFAULT_LICENSE_NUMBER = "00000";
            const warningMsg =
              `Replaced license number ${parsedLicense.license_number} with placeholder: ${DEFAULT_LICENSE_NUMBER}`;
            log(`Warning: ${warningMsg}`);
            warnings.push(warningMsg);

            // Set placeholder number
            parsedLicense.license_number = DEFAULT_LICENSE_NUMBER;
          }

          // Validate and clean license data - skip if title is not in allowed list
          if (
            parsedLicense.title &&
            !VALID_LICENSE_TITLES.includes(parsedLicense.title)
          ) {
            const errorMsg = `Invalid license title: ${parsedLicense.title}`;
            log(
              `Warning: ${errorMsg} - License: ${
                JSON.stringify(parsedLicense)
              }`,
            );
            warnings.push(errorMsg);
            continue;
          }

          // Validate license state/jurisdiction
          if (
            parsedLicense.state &&
            !VALID_JURISDICTIONS.includes(parsedLicense.state)
          ) {
            const errorMsg =
              `Invalid license jurisdiction: ${parsedLicense.state}`;
            log(
              `Warning: ${errorMsg} - License: ${
                JSON.stringify(parsedLicense)
              }`,
            );
            // Try to find a close match or default to BC
            parsedLicense.state =
              findClosestMatch(parsedLicense.state, VALID_JURISDICTIONS) ||
              "BC";
          }

          licenses.push(parsedLicense);
          log(
            `Successfully processed license: ${parsedLicense.license_number}`,
          );
        } catch (e: unknown) {
          const errorMsg = `Error parsing license: ${(e as Error).message}`;
          log(`${errorMsg} - Raw license data: ${JSON.stringify(licenseItem)}`);
          warnings.push(errorMsg);
        }
      }
    }

    log(`Total licenses to process: ${licenses.length}`);

    // Extract and ensure areas_of_focus and certifications are arrays
    const education = processEducationField(profileData.education);
    const certifications = processCertificationsField(
      profileData.certifications,
    );
    const areasOfFocus = processAreasOfFocusField(profileData.areas_of_focus);
    const languages = ensureArray(profileData.languages);

    // Handle approaches - the database expects a string array, not an object
    let approaches = processApproachesField(profileData.approaches);
    log(`Processed approaches field: ${approaches.length} items`);

    // Ensure approaches is definitely a string array
    if (!Array.isArray(approaches)) {
      log(`WARNING: approaches is not an array: ${typeof approaches}`);
      approaches = [];
      warnings.push(
        "Approaches data was not in the expected format and was reset to an empty array",
      );
    } else {
      log(
        `Approaches is confirmed as an array with ${approaches.length} items`,
      );
    }

    // Validate and clean enum values
    const sexuality = validateEnumArray(
      validateArray(profileData, "sexuality"),
      VALID_SEXUALITY_TYPES,
    );
    const ethnicity = validateEnumArray(
      validateArray(profileData, "ethnicity"),
      VALID_ETHNICITY_TYPES,
    );
    const faith = validateEnumArray(
      validateArray(profileData, "faith"),
      VALID_FAITH_TYPES,
    );

    // Clean and validate singular enum values
    const pronounsValue = profileData.pronouns
      ? String(profileData.pronouns)
      : null;
    const pronouns = validateEnumValue(pronounsValue, VALID_PRONOUNS_TYPES);
    if (pronounsValue && !pronouns) {
      warnings.push(
        `Invalid pronouns value: ${pronounsValue}. Using null instead.`,
      );
    }

    // Validate gender
    let gender = profileData.gender;
    if (gender && !["female", "male", "non_binary"].includes(gender)) {
      warnings.push(`Invalid gender value: ${gender}`);
      log(`Warning: Invalid gender value: ${gender}`);
      gender = null;
    }

    // Validate availability
    let availability = profileData.availability;
    if (
      availability && !["online", "in_person", "both"].includes(availability)
    ) {
      warnings.push(`Invalid availability value: ${availability}`);
      log(`Warning: Invalid availability value: ${availability}`);
      availability = null;
    }

    // Handle bio field which might be too long
    let bio = profileData.bio;
    if (bio && typeof bio === "string" && bio.length > 5000) {
      bio = bio.substring(0, 4997) + "...";
      warnings.push("Bio was truncated to 5000 characters");
      log("Warning: Bio was truncated to 5000 characters");
    }

    // Check for missing required keys
    const requiredKeys = [
      "first_name",
      "last_name",
      "gender",
      "clinic_name",
      "availability",
    ];
    const missingKeys: string[] = [];
    requiredKeys.forEach((key) => {
      if (!profileData[key]) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      log(`[ERROR] Missing required keys: ${missingKeys.join(", ")}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          missing_keys: missingKeys,
          logs: logs,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if a therapist with the same name already exists
    const duplicateCheck = await checkForExistingTherapist(
      supabase,
      profileData.first_name,
      profileData.last_name,
      log,
    );

    if (duplicateCheck.error) {
      // Log but continue if there was an error checking
      warnings.push(
        `Error checking for duplicates: ${duplicateCheck.error.message}`,
      );
    } else if (duplicateCheck.exists) {
      // Return error response if duplicate exists
      return new Response(
        JSON.stringify({
          success: false,
          error: "Duplicate therapist",
          message:
            `A therapist with the name ${profileData.first_name} ${profileData.last_name} already exists.`,
          existing_id: duplicateCheck.therapist.id,
          logs: logs,
          warnings: warnings,
        }),
        {
          status: 409, // Conflict status code
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const therapistData = {
      first_name: profileData.first_name,
      middle_name: profileData.middle_name || null,
      last_name: profileData.last_name,
      pronouns: pronouns,
      gender: gender,
      sexuality: sexuality,
      ethnicity: ethnicity,
      faith: faith,
      profile_img_url: profileImgUrl,
      clinic_profile_url: clinicProfileUrl,
      clinic_booking_url: clinicBookingUrl,
      bio: bio || null,
      clinic_name: profileData.clinic_name,
      clinic_street: profileData.clinic_street || null,
      clinic_city: profileData.clinic_city || "Vancouver",
      clinic_postal_code: profileData.clinic_postal_code || null,
      clinic_province: profileData.clinic_province || clinic_province,
      clinic_country: profileData.clinic_country || clinic_country,
      clinic_phone: profileData.clinic_phone || null,
      therapist_email: profileData.therapist_email || null,
      therapist_phone: profileData.therapist_phone || null,
      availability: availability,
      education: education,
      certifications: certifications,
      approaches: approaches,
      areas_of_focus: areasOfFocus,
      languages: languages,
      creation_log: JSON.stringify({
        timestamp: new Date().toISOString(),
        logs: logs,
        warnings: warnings,
        source: "gumloop_edge_function",
      }),
    };

    const { data: therapistResult, error: therapistError } = await supabase
      .from("therapists")
      .insert(therapistData)
      .select("id")
      .single();

    if (therapistError) {
      log(
        `[insert-error] ${profileData.first_name} ${profileData.last_name}: ${therapistError.message}`,
      );

      try {
        const errorLogData = {
          first_name: profileData.first_name || "Unknown",
          last_name: profileData.last_name || "Unknown",
          gender: "error_placeholder",
          clinic_name: "Error record",
          availability: "online",
          creation_log: JSON.stringify({
            timestamp: new Date().toISOString(),
            error: "Database error during therapist insertion",
            error_message: therapistError.message,
            error_details: therapistError,
            data_attempted: therapistData,
            logs: logs,
            warnings: warnings,
            source: "gumloop_edge_function_error",
          }),
        };

        const { data: errorLogResult, error: errorLogError } = await supabase
          .from("therapists")
          .insert(errorLogData)
          .select("id");

        if (errorLogError) {
          log(
            `[insert-error-log] ${profileData.first_name} ${profileData.last_name}: ${errorLogError.message}`,
          );
        } else {
          log(
            `[insert-error-log] Created error log entry for ${profileData.first_name} ${profileData.last_name} with ID: ${
              errorLogResult[0].id
            }`,
          );
        }
      } catch (logError: unknown) {
        log(
          `Exception while creating error log: ${(logError as Error).message}`,
        );
      }

      // Return the original error response
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database error during therapist insertion",
          message: therapistError.message,
          details: therapistError,
          data_attempted: therapistData,
          length_certifications: therapistData.certifications.length,
          length_approaches: therapistData.approaches.length,
          length_areas_of_focus: therapistData.areas_of_focus.length,
          length_languages: therapistData.languages.length,
          length_education: therapistData.education.length,
          logs: logs,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const therapistId = therapistResult.id;
    log(`Successfully inserted therapist with ID: ${therapistId}`);

    // Insert license data if available
    const licenseResults = [];
    log(`Starting license insertion for ${licenses.length} licenses...`);
    if (licenses.length > 0) {
      log(`Starting license insertion for ${licenses.length} licenses...`);
      log(`raw licenses: ${JSON.stringify(licenses)}`);

      for (const license of licenses) {
        const licenseData = {
          therapist_id: therapistId,
          license_number: license.license_number,
          state: license.state,
          title: license.title,
          issuing_body: license.issuing_body || null,
          expiry_date: license.expiry_date || null,
        };

        log(`Inserting license data: ${JSON.stringify(licenseData)}`);

        const { data: licenseInsertResult, error: licenseError } =
          await supabase
            .from("therapist_licenses")
            .insert(licenseData)
            .select("id")
            .single();

        if (licenseError) {
          const errorMsg =
            `License insertion failed: ${licenseError.message} for license: ${
              JSON.stringify(licenseData)
            }`;
          log(`Error inserting license: ${errorMsg}`);
          warnings.push(errorMsg);
        } else {
          licenseResults.push(licenseInsertResult);
          log(
            `Successfully inserted license with ID: ${licenseInsertResult.id}`,
          );
        }
      }
    } else {
      log(
        "No license data to insert or all licenses were filtered out during validation",
      );
      log("No license data to insert");
      // Add a warning if we expected license data but none was provided
      if (
        payload.licenses !== undefined &&
        (!Array.isArray(payload.licenses) || payload.licenses.length === 0)
      ) {
        const warningMsg =
          "License data was expected but none was provided or processable";
        log(
          `Warning: ${warningMsg} - Payload licenses: ${
            JSON.stringify(payload.licenses)
          }`,
        );
        warnings.push(warningMsg);
      }
    }

    // Insert fee data if available
    const feeResults = [];
    if (fees.length > 0) {
      log(`Starting fee insertion for ${fees.length} fees...`);

      for (const fee of fees) {
        if (
          fee.session_category &&
          !VALID_SESSION_CATEGORIES.includes(fee.session_category)
        ) {
          const errorMsg =
            `Invalid session_category: ${fee.session_category} for fee: ${
              JSON.stringify(fee)
            }`;
          warnings.push(errorMsg);
          log(`[fee] warning: ${errorMsg}`);
          continue;
        }

        if (
          fee.session_type && !VALID_SESSION_TYPES.includes(fee.session_type)
        ) {
          const errorMsg =
            `Invalid session_type: ${fee.session_type} for fee: ${
              JSON.stringify(fee)
            }.`;
          warnings.push(errorMsg);
          log(`[fee] warning: ${errorMsg}`);
          continue;
        }

        if (
          fee.delivery_method &&
          !VALID_DELIVERY_METHODS.includes(fee.delivery_method)
        ) {
          const errorMsg =
            `Invalid delivery_method: ${fee.delivery_method}. Full fee: ${
              JSON.stringify(fee)
            }`;
          warnings.push(errorMsg);
          log(`Warning: ${errorMsg} - Fee: ${JSON.stringify(fee)}`);
          continue;
        }

        const feeData = {
          therapist_id: therapistId,
          session_category: fee.session_category,
          session_type: fee.session_type,
          delivery_method: fee.delivery_method,
          duration_minutes: fee.duration_minutes || 0, // Default to 0 if empty
          price: fee.price || 0, // Default to 0 if empty
          currency: fee.currency || "CAD", // Default to CAD
        };

        const { data: feeInsertResult, error: feeError } = await supabase
          .from("therapist_fees")
          .insert(feeData)
          .select("id");

        if (feeError) {
          log(`Error inserting fee: ${feeError.message}`);
          warnings.push(`Fee insertion failed: ${feeError.message}`);
        } else if (feeInsertResult) {
          feeResults.push(feeInsertResult);
        }
      }
    } else {
      log(
        "No fee data to insert for therapist: " + therapistId + " " +
          profileData.first_name + " " + profileData.last_name,
      );
    }

    // Prepare successful response
    log("Preparing successful response");
    const responseData = {
      therapist_id: therapistId,
      profile_image_url: profileImgUrl,
      clinic_profile_url: clinicProfileUrl,
      clinic_booking_url: clinicBookingUrl,
      fees_inserted: feeResults.length,
      license_inserted: licenseResults.length > 0,
      warnings: warnings, // Always include all warnings
      logs: logs,
    };

    // Return the extracted information
    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        message:
          `Success: ${profileData.first_name} ${profileData.last_name} was inserted. ID: ${therapistId}`,
        warnings: warnings, // Always include the warnings array (even if empty)
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error processing request:", error);
    logs.push(`Critical error: ${(error as Error).message}`);

    // Try to create an error log entry in the database
    try {
      // Create a minimal valid therapist record with error details
      const supabase = createSupabaseClient();
      const errorLogData = {
        first_name: "Error",
        last_name: "Record",
        // For the minimal required fields, provide placeholder values
        gender: "error_placeholder",
        clinic_name: "Critical Error Record",
        availability: "online",
        creation_log: JSON.stringify({
          timestamp: new Date().toISOString(),
          error: "Critical unexpected error in edge function",
          error_message: (error as Error).message,
          error_stack: (error as Error).stack,
          logs: logs,
          source: "gumloop_edge_function_critical_error",
        }),
      };

      console.log("Attempting to create critical error log entry in database");
      const { data: errorLogResult, error: errorLogError } = await supabase
        .from("therapists")
        .insert(errorLogData)
        .select("id");

      if (errorLogError) {
        console.error(
          `Failed to create critical error log entry: ${errorLogError.message}`,
        );
      } else {
        console.log(
          `Created critical error log entry with ID: ${errorLogResult[0].id}`,
        );
      }
    } catch (logError) {
      console.error(
        `Exception while creating critical error log: ${
          (logError as Error).message
        }`,
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: (error as Error).message,
        stack: (error as Error).stack,
        logs: logs,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

// Special processing for education field - tries to intelligently split education items
function processEducationField(value: any): string[] {
  const rawArray = ensureArray(value);

  // Process each education entry
  const result: string[] = [];
  for (const item of rawArray) {
    // Look for patterns like "Bachelor X at Y, Master Z at W"
    if (
      item.includes(" at ") &&
      (item.includes("Bachelor") || item.includes("Master") ||
        item.includes("PhD") || item.includes("Diploma"))
    ) {
      // Split by comma if we see degree keywords repeated
      if (
        (item.match(/Bachelor/g) || []).length > 1 ||
        (item.match(/Master/g) || []).length > 1 ||
        (item.match(/PhD/g) || []).length > 1 ||
        (item.match(/Diploma/g) || []).length > 1
      ) {
        // Split by comma and add each part
        const parts = item.split(",").map((p) => p.trim()).filter(Boolean);
        result.push(...parts);
      } else {
        // If no repeated degrees, add as is
        result.push(item);
      }
    } else {
      // For other formats, add as is
      result.push(item);
    }
  }

  return result;
}

// Special processing for certifications field
function processCertificationsField(value: any): string[] {
  const rawArray = ensureArray(value);

  // Process each certification entry
  const result: string[] = [];
  for (const item of rawArray) {
    // Check for patterns like "Certification X, Certification Y"
    // If we see "Registered" or certificate-specific keywords multiple times, split by comma
    if (
      (item.match(/Registered/g) || []).length > 1 ||
      (item.match(/Certified/g) || []).length > 1 ||
      (item.match(/Certificate/g) || []).length > 1
    ) {
      // Split by comma and add each part
      const parts = item.split(",").map((p) => p.trim()).filter(Boolean);
      result.push(...parts);
    } else {
      // Otherwise add as is
      result.push(item);
    }
  }

  return result;
}

// Special processing for areas of focus
function processAreasOfFocusField(value: any): string[] {
  // Always split areas of focus by comma as they should be distinct items
  const rawArray = ensureArray(value);

  // Join all entries, then split by comma
  const combinedText = rawArray.join(", ");
  return combinedText.split(",").map((item) => item.trim()).filter(Boolean);
}

// Handle approaches - the database expects a string array, not an object
function processApproachesField(value: any): string[] {
  console.log(`Processing approaches field - Input type: ${typeof value}`);
  if (value === null || value === undefined) {
    console.log("Approaches field is null or undefined");
    return [];
  }

  const rawArray = ensureArray(value);
  console.log(`After ensureArray: ${JSON.stringify(rawArray)}`);

  // For approaches stored in an object structure, flatten it to array
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // If we have a {long_term: [...]} object structure, extract the array
    if (value.long_term && Array.isArray(value.long_term)) {
      console.log("Found long_term array in approaches object");
      const result = value.long_term.map((item: any) => String(item).trim())
        .filter(Boolean);
      console.log(`Extracted ${result.length} approaches from long_term array`);
      return result;
    }

    // Try to extract values from any other object structure
    const allValues: string[] = [];
    for (const key in value) {
      if (Array.isArray(value[key])) {
        console.log(`Found array in approaches object at key: ${key}`);
        allValues.push(...value[key].map((item: any) => String(item).trim()));
      } else if (value[key]) {
        console.log(
          `Found non-array value in approaches object at key: ${key}`,
        );
        allValues.push(String(value[key]).trim());
      }
    }

    console.log(`Extracted ${allValues.length} approaches from object keys`);
    return allValues.filter(Boolean);
  }

  // Join all entries, then split by comma for consistent processing
  console.log("Processing approaches as array or string");
  const combinedText = rawArray.join(", ");
  const result = combinedText.split(",").map((item) => item.trim()).filter(
    Boolean,
  );
  console.log(`Final approaches array contains ${result.length} items`);
  return result;
}
