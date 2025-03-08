// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

console.log("Gumloop webhook handler started!");

// Define interfaces based on our database schema - kept for reference
// but not used in the simple text handling version
interface TherapistData {
  // Basic info
  first_name: string;
  middle_name?: string;
  last_name: string;
  pronouns?: string;
  gender: 'female' | 'male' | 'non_binary';
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
  clinic_postal_code: string;
  clinic_province: string;
  clinic_country: string;
  clinic_phone?: string;

  // Availability
  availability: 'online' | 'in_person' | 'both';

  // Professional Details
  education?: string[];
  certifications?: string[];
  approaches?: string[];
  areas_of_focus?: string[];
  languages?: string[];
  bio?: string;
}

interface TherapistFee {
  session_category: 'initial' | 'consultation' | 'subsequent';
  session_type: 'individual' | 'couples' | 'family' | 'group';
  delivery_method: 'in_person' | 'virtual' | 'hybrid';
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

interface GumloopPayload {
  therapist: TherapistData;
  fees?: TherapistFee[];
  licenses?: TherapistLicense[];
}

// New interfaces for the incoming payload structure
interface ProfileData {
  profile: string;
  fees?: string[];
  profile_img_url?: string;
  clinic_profile_url?: string;
  clinic_booking_url?: string;
}

// Define valid enum values based exactly on the SQL schema
const VALID_SEXUALITY_TYPES = [
  'straight', 'gay', 'lesbian', 'bisexual', 'queer', 'pansexual', 
  'asexual', 'questioning', 'prefer_not_to_say'
];

const VALID_ETHNICITY_TYPES = [
  'asian', 'black', 'hispanic', 'indigenous', 'middle_eastern', 
  'pacific_islander', 'white', 'multiracial', 'prefer_not_to_say'
];

const VALID_FAITH_TYPES = [
  'agnostic', 'atheist', 'buddhist', 'christian', 'hindu', 'jewish',
  'muslim', 'sikh', 'spiritual', 'other', 'prefer_not_to_say'
];

const VALID_PRONOUNS_TYPES = [
  'she/her', 'he/him', 'they/them', 'ze/zir', 'prefer_not_to_say'
];

const VALID_SESSION_CATEGORIES = [
  'initial', 'consultation', 'subsequent'
];

const VALID_SESSION_TYPES = [
  'individual', 'couples', 'family', 'group'
];

const SESSION_TYPE_MAPPING: Record<string, string> = {
  'relationship': 'couples'
};

const VALID_DELIVERY_METHODS = [
  'in_person', 'virtual', 'hybrid'
];

const VALID_JURISDICTIONS = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

const VALID_LICENSE_TITLES = [
  'CPsych', 'MD', 'NP', 'RCC', 'RN', 'RP', 'RSW'
];

// Helper function to clean markdown formatting from strings
function cleanMarkdownFormatting(text: string | null | undefined): string | null {
  if (!text) return null;
  
  // Remove markdown code block notation and language identifier
  let cleanText = text.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
  
  // Remove any remaining backticks
  cleanText = cleanText.replace(/`/g, '');
  
  return cleanText;
}

// Parse YAML-like text into key-value pairs
function parseProfileText(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = text.split('\n');
  
  let currentKey = '';
  
  for (const line of lines) {
    // Skip empty lines or section headers
    if (line.trim() === '' || line.startsWith('#')) {
      continue;
    }
    
    // Check if this is a key-value pair
    const kvMatch = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      
      // Handle array values
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          // Try to parse as JSON array
          result[currentKey] = JSON.parse(value);
        } catch (e) {
          // If JSON parsing fails, split by commas and trim
          result[currentKey] = value.slice(1, -1).split(',').map(s => s.trim());
        }
      } else if (value === 'null' || value === '') {
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
    try {
      let feeObj: any;
      
      // Try to clean markdown formatting if present
      const cleanFeeString = cleanMarkdownFormatting(feeString) || feeString;
      
      try {
        feeObj = JSON.parse(cleanFeeString);
      } catch (e) {
        console.warn(`Failed to parse fee JSON: ${e.message}`);
        continue;
      }
      
      // Basic validation
      if (typeof feeObj !== 'object') {
        console.warn(`Fee is not an object: ${feeString}`);
        continue;
      }
      
      // Map "relationship" session type to "couples"
      if (feeObj.session_type && SESSION_TYPE_MAPPING[feeObj.session_type]) {
        feeObj.session_type = SESSION_TYPE_MAPPING[feeObj.session_type];
      }
      
      // Convert duration to number
      if (feeObj.duration_minutes) {
        feeObj.duration_minutes = Number(feeObj.duration_minutes);
        if (isNaN(feeObj.duration_minutes)) {
          console.warn(`Invalid duration_minutes: ${feeObj.duration_minutes}`);
          feeObj.duration_minutes = 0;
        }
      } else {
        // Set default value for duration_minutes if it's missing or empty
        feeObj.duration_minutes = 0;
      }
      
      // Convert price to number
      if (feeObj.price !== undefined && feeObj.price !== null) {
        feeObj.price = Number(feeObj.price);
        if (isNaN(feeObj.price)) {
          console.warn(`Invalid price: ${feeObj.price}`);
          feeObj.price = 0;
        }
      } else {
        // Set default value for price if it's missing or empty
        feeObj.price = 0;
      }
      
      fees.push(feeObj as TherapistFee);
    } catch (e) {
      console.warn(`Failed to parse fee: ${feeString}`, e);
    }
  }
  
  return fees;
}

// Function to ensure we have an array
function ensureArray(value: any): string[] {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    // If it's an array with a single string that might contain comma-separated values
    if (value.length === 1 && typeof value[0] === 'string' && value[0].includes(',')) {
      // Split the single string by commas and trim each item
      return value[0].split(',').map(item => item.trim()).filter(Boolean);
    }
    
    // If it's a regular array, make sure all elements are strings
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  
  if (typeof value === 'string') {
    // If it's a JSON array string
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        // After parsing, check if we have an array with a single comma-separated string
        return ensureArray(parsed);
      } catch (e) {
        // If parsing fails, split by comma
        return value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    // If it's a comma-separated string
    if (value.includes(',')) {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    // If it's a single value
    return [value.trim()].filter(Boolean);
  }
  
  return [];
}

// Function to validate arrays
function validateArray(data: any, key: string): string[] {
  if (!data[key]) return [];
  
  return ensureArray(data[key]);
}

// Validate and clean enum values
function validateEnumValue(value: string | null | undefined, validValues: string[], defaultValue: string | null = null): string | null {
  if (!value) return defaultValue;
  
  // Remove any quotes
  let cleanValue = String(value).replace(/^['"]+|['"]+$/g, '').trim().toLowerCase();
  
  // Check if value is valid
  if (validValues.includes(cleanValue)) {
    return cleanValue;
  }
  
  // Try to convert spaces to underscores
  cleanValue = cleanValue.replace(/\s+/g, '_');
  if (validValues.includes(cleanValue)) {
    return cleanValue;
  }
  
  console.warn(`Invalid enum value: ${value}. Valid values are: ${validValues.join(', ')}`);
  return defaultValue;
}

// Validate enum arrays (e.g., sexuality, ethnicity, faith)
function validateEnumArray(values: string[] | null | undefined, validValues: string[]): string[] {
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
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API SERVICE ROLE KEY - env var exported by default when deployed
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  return supabaseClient;
}

// Cleans the URL fields to ensure they're properly formatted
function cleanUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // Remove any markdown link syntax
  if (url.startsWith('[') && url.includes('](') && url.endsWith(')')) {
    // Extract URL part from markdown: [link text](url)
    const matches = url.match(/\[.*\]\((.*)\)/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
  }
  
  // Handle markdown image syntax
  if (url.startsWith('![') && url.includes('](') && url.endsWith(')')) {
    // Extract URL part from markdown: ![alt text](url)
    const matches = url.match(/!\[.*\]\((.*)\)/);
    if (matches && matches[1]) {
      return matches[1].trim();
    }
  }
  
  // Ensure URL has http:// or https://
  if (url && !url.match(/^https?:\/\//i) && !url.startsWith('mailto:')) {
    return `https://${url}`;
  }
  
  return url;
}

Deno.serve(async (req) => {
  // Hardcoded Values
  const clinic_country = "CA";
  const clinic_province = "BC";
  const clinic_city = "Vancouver";
  const warnings: string[] = [];
  const logs: string[] = [];
  
  function log(message: string) {
    console.log(message);
    logs.push(message);
  }

  try {
    // Initialize the Supabase client
    const supabase = createSupabaseClient();
    log("Supabase client initialized");

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
        }
      );
    }

    // Get the raw text regardless of content type
    const textData = await req.text();
    log(`Received text data, length: ${textData.length}`);
    log(`Text content sample: ${textData.substring(0, 200)}`);

    // Parse the incoming JSON data
    let payload;
    try {
      payload = JSON.parse(textData);
      log(`Payload structure: ${Object.keys(payload).join(', ')}`);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: e.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check payload structure and extract data accordingly
    let profileData: Record<string, any> = {};
    let fees: TherapistFee[] = [];
    let license: TherapistLicense | null = null;
    let profileImgUrl: string | null = null;
    let clinicProfileUrl: string | null = null;
    let clinicBookingUrl: string | null = null;

    // Handle the new payload structure with profile and fees
    if (payload.profile && typeof payload.profile === 'string') {
      try {
        // Try to parse profile as JSON if it's a string that contains JSON
        let cleanProfile = cleanMarkdownFormatting(payload.profile) || payload.profile;
        const parsedProfile = JSON.parse(cleanProfile);
        profileData = parsedProfile;
        log("Successfully parsed profile JSON string");
      } catch (e) {
        // If it's not JSON, try to parse it as YAML-like text
        profileData = parseProfileText(payload.profile);
        log("Parsed profile text in YAML-like format");
      }
    } else if (typeof payload.profile === 'object' && payload.profile !== null) {
      profileData = payload.profile;
      log("Using profile object from payload");
    } else if (payload.therapist) {
      // Handle the old expected structure
      profileData = payload.therapist;
      log("Using therapist object from payload");
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid payload structure",
          message: "Expected either 'profile' or 'therapist' field",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract fees
    if (payload.fees && Array.isArray(payload.fees)) {
      fees = parseFees(payload.fees);
      log(`Parsed ${fees.length} fee records`);
    } else if (payload.fees) {
      warnings.push("Fees field is not an array");
      log("Warning: Fees field is not an array");
    }

    // Extract profile image URL
    if (payload.profile_img_url) {
      profileImgUrl = cleanUrl(payload.profile_img_url);
      log("Found profile image URL in payload root");
    } else if (profileData.profile_img_url) {
      profileImgUrl = cleanUrl(profileData.profile_img_url);
      log("Found profile image URL in profile data");
    }

    // Extract clinic profile URL
    if (payload.clinic_profile_url) {
      clinicProfileUrl = cleanUrl(payload.clinic_profile_url);
      log("Found clinic profile URL in payload root");
    } else if (profileData.clinic_profile_url) {
      clinicProfileUrl = cleanUrl(profileData.clinic_profile_url);
      log("Found clinic profile URL in profile data");
    }

    // Extract clinic booking URL
    if (payload.clinic_booking_url) {
      clinicBookingUrl = cleanUrl(payload.clinic_booking_url);
      log("Found clinic booking URL in payload root");
    } else if (profileData.clinic_booking_url) {
      clinicBookingUrl = cleanUrl(profileData.clinic_booking_url);
      log("Found clinic booking URL in profile data");
    }

    // Extract license data
    if (payload.license) {
      try {
        if (typeof payload.license === 'string') {
          // Clean any markdown formatting
          const cleanLicense = cleanMarkdownFormatting(payload.license);
          license = JSON.parse(cleanLicense || payload.license);
          log("Parsed license from JSON string");
        } else if (typeof payload.license === 'object') {
          license = payload.license as TherapistLicense;
          log("Found license object in payload root");
        }
      } catch (e) {
        log(`Error parsing license: ${e.message}`);
        warnings.push(`Could not parse license data: ${e.message}`);
      }
    } else if (profileData.license_number && profileData.title && profileData.state) {
      license = {
        license_number: String(profileData.license_number).replace(/^#/, ''), // Remove leading # if present
        title: String(profileData.title),
        state: String(profileData.state),
        issuing_body: profileData.issuing_body ? String(profileData.issuing_body) : undefined,
        expiry_date: profileData.expiry_date ? String(profileData.expiry_date) : undefined
      };
      log("Extracted license data from profile text");
    }

    // Validate license data if present
    if (license) {
      // Validate license title
      if (license.title && !VALID_LICENSE_TITLES.includes(license.title)) {
        warnings.push(`Invalid license title: ${license.title}`);
        log(`Warning: Invalid license title: ${license.title}`);
        // Try to find a close match
        license.title = findClosestMatch(license.title, VALID_LICENSE_TITLES) || license.title;
      }
      
      // Validate license state/jurisdiction
      if (license.state && !VALID_JURISDICTIONS.includes(license.state)) {
        warnings.push(`Invalid license jurisdiction: ${license.state}`);
        log(`Warning: Invalid license jurisdiction: ${license.state}`);
        // Try to find a close match or default to BC
        license.state = findClosestMatch(license.state, VALID_JURISDICTIONS) || 'BC';
      }
    }

    // Extract and ensure areas_of_focus and certifications are arrays
    const education = processEducationField(profileData.education);
    const certifications = processCertificationsField(profileData.certifications); 
    const areasOfFocus = processAreasOfFocusField(profileData.areas_of_focus);
    const languages = ensureArray(profileData.languages);
    
    // Handle approaches - the database expects a string array, not an object
    let approaches = processApproachesField(profileData.approaches);
    log(`Processed approaches field: ${JSON.stringify(approaches)}`);
    log(`Original approaches data type: ${typeof profileData.approaches}`);
    if (typeof profileData.approaches === 'object') {
      log(`Original approaches structure: ${JSON.stringify(profileData.approaches)}`);
    }

    // Ensure approaches is definitely a string array
    if (!Array.isArray(approaches)) {
      log(`WARNING: approaches is not an array: ${typeof approaches}`);
      approaches = [];
      warnings.push("Approaches data was not in the expected format and was reset to an empty array");
    } else {
      log(`Approaches is confirmed as an array with ${approaches.length} items`);
    }

    // Validate and clean enum values
    const sexuality = validateEnumArray(validateArray(profileData, 'sexuality'), VALID_SEXUALITY_TYPES);
    const ethnicity = validateEnumArray(validateArray(profileData, 'ethnicity'), VALID_ETHNICITY_TYPES);
    const faith = validateEnumArray(validateArray(profileData, 'faith'), VALID_FAITH_TYPES);
    
    // Clean and validate singular enum values
    let pronounsValue = profileData.pronouns ? String(profileData.pronouns) : null;
    const pronouns = validateEnumValue(pronounsValue, VALID_PRONOUNS_TYPES);
    if (pronounsValue && !pronouns) {
      warnings.push(`Invalid pronouns value: ${pronounsValue}. Using null instead.`);
    }

    // Validate gender
    let gender = profileData.gender;
    if (gender && !['female', 'male', 'non_binary'].includes(gender)) {
      warnings.push(`Invalid gender value: ${gender}`);
      log(`Warning: Invalid gender value: ${gender}`);
      gender = null;
    }

    // Validate availability
    let availability = profileData.availability;
    if (availability && !['online', 'in_person', 'both'].includes(availability)) {
      warnings.push(`Invalid availability value: ${availability}`);
      log(`Warning: Invalid availability value: ${availability}`);
      availability = null;
    }

    // Handle bio field which might be too long
    let bio = profileData.bio;
    if (bio && typeof bio === 'string' && bio.length > 5000) {
      bio = bio.substring(0, 4997) + '...';
      warnings.push("Bio was truncated to 5000 characters");
      log("Warning: Bio was truncated to 5000 characters");
    }

    // Check for missing required keys
    const requiredKeys = ['first_name', 'last_name', 'gender', 'clinic_name', 'availability'];
    const missingKeys: string[] = [];
    requiredKeys.forEach(key => {
      if (!profileData[key]) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      log(`Missing required keys: ${missingKeys.join(', ')}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          missing_keys: missingKeys,
          logs: logs
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prepare therapist data for insertion
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
      clinic_city: profileData.clinic_city || clinic_city,
      clinic_postal_code: profileData.clinic_postal_code || null,
      clinic_province: profileData.clinic_province || clinic_province,
      clinic_country: profileData.clinic_country || clinic_country,
      clinic_phone: profileData.clinic_phone || null,
      therapist_email: profileData.therapist_email || null,
      therapist_phone: profileData.therapist_phone || null,
      availability: availability,
      education: education,
      certifications: certifications,
      approaches: approaches, // Verified to be a string array
      areas_of_focus: areasOfFocus,
      languages: languages
    };

    log("Prepared therapist data for insertion");
    log(`Therapist data: ${JSON.stringify(therapistData, null, 2)}`);
    
    // Insert therapist record to get an ID
    log("Starting therapist insertion...");
    const { data: therapistResult, error: therapistError } = await supabase
      .from('therapists')
      .insert(therapistData)
      .select('id')
      .single();

    if (therapistError) {
      log(`Error inserting therapist: ${therapistError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database error during therapist insertion",
          message: therapistError.message,
          details: therapistError,
          data_attempted: therapistData,
          logs: logs
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const therapistId = therapistResult.id;
    log(`Successfully inserted therapist with ID: ${therapistId}`);

    // Insert license data if available
    let licenseResult = null;
    if (license) {
      log("Starting license insertion...");
      log(`License data: ${JSON.stringify(license, null, 2)}`);
      
      const licenseData = {
        therapist_id: therapistId,
        license_number: license.license_number,
        state: license.state,
        title: license.title,
        issuing_body: license.issuing_body || null,
        expiry_date: license.expiry_date || null
      };

      const { data: licenseInsertResult, error: licenseError } = await supabase
        .from('therapist_licenses')
        .insert(licenseData)
        .select('id')
        .single();

      if (licenseError) {
        log(`Error inserting license: ${licenseError.message}`);
        warnings.push(`License insertion failed: ${licenseError.message}`);
      } else {
        licenseResult = licenseInsertResult;
        log(`Successfully inserted license with ID: ${licenseInsertResult.id}`);
      }
    } else {
      log("No license data to insert");
    }

    // Insert fee data if available
    let feeResults = [];
    if (fees.length > 0) {
      log(`Starting fee insertion for ${fees.length} fees...`);
      
      for (const fee of fees) {
        // Map relationship to couples
        if (fee.session_type === 'relationship') {
          fee.session_type = 'couples';
          log(`Mapped 'relationship' session type to 'couples'`);
        }
        
        // Validate fee fields
        if (fee.session_category && !VALID_SESSION_CATEGORIES.includes(fee.session_category)) {
          warnings.push(`Invalid session_category: ${fee.session_category}`);
          log(`Warning: Invalid session_category: ${fee.session_category}`);
          continue;
        }
        
        if (fee.session_type && !VALID_SESSION_TYPES.includes(fee.session_type)) {
          warnings.push(`Invalid session_type: ${fee.session_type}`);
          log(`Warning: Invalid session_type: ${fee.session_type}`);
          continue;
        }
        
        if (fee.delivery_method && !VALID_DELIVERY_METHODS.includes(fee.delivery_method)) {
          warnings.push(`Invalid delivery_method: ${fee.delivery_method}`);
          log(`Warning: Invalid delivery_method: ${fee.delivery_method}`);
          continue;
        }
        
        const feeData = {
          therapist_id: therapistId,
          session_category: fee.session_category,
          session_type: fee.session_type,
          delivery_method: fee.delivery_method,
          duration_minutes: fee.duration_minutes || 0,  // Default to 0 if empty
          price: fee.price || 0,  // Default to 0 if empty
          currency: fee.currency || 'CAD' // Default to CAD
        };
        
        log(`Fee data: ${JSON.stringify(feeData, null, 2)}`);

        const { data: feeInsertResult, error: feeError } = await supabase
          .from('therapist_fees')
          .insert(feeData)
          .select('id');

        if (feeError) {
          log(`Error inserting fee: ${feeError.message}`);
          warnings.push(`Fee insertion failed: ${feeError.message}`);
        } else if (feeInsertResult) {
          feeResults.push(feeInsertResult);
          log(`Successfully inserted fee with ID: ${feeInsertResult[0].id}`);
        }
      }
    } else {
      log("No fee data to insert");
    }

    // Build response data
    const responseData = {
      therapist_id: therapistId,
      profile: {
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
        clinic_city: profileData.clinic_city || clinic_city,
        clinic_postal_code: profileData.clinic_postal_code || null,
        clinic_province: profileData.clinic_province || clinic_province,
        clinic_country: profileData.clinic_country || clinic_country,
        therapist_email: profileData.therapist_email || null,
        therapist_phone: profileData.therapist_phone || null,
        availability: availability,
        education: education,
        certifications: certifications,
        approaches: approaches,
        areas_of_focus: areasOfFocus,
        languages: languages,
      },
      fees_inserted: feeResults.length,
      license_inserted: licenseResult !== null,
      warnings: warnings.length > 0 ? warnings : null,
      logs: logs
    };

    log("Preparing successful response");

    // Return the extracted information
    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        message: "Therapist and related data inserted successfully",
        warnings: warnings.length > 0 ? warnings : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error processing request:", error);
    logs.push(`Critical error: ${error.message}`);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
        stack: error.stack,
        logs: logs
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/gumloop' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"profile": "{\"first_name\": \"John\", \"last_name\": \"Doe\", \"gender\": \"male\", \"clinic_name\": \"Example Clinic\", \"clinic_street\": \"123 Main St\", \"clinic_city\": \"Vancouver\", \"clinic_postal_code\": \"V6B 2W9\", \"clinic_province\": \"BC\", \"clinic_country\": \"CA\", \"availability\": \"both\"}"}'

  curl -i --location --request POST 'https://joypkrixfrtsyjcsyeeb.supabase.co/functions/v1/gumloop' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveXBrcml4ZnJ0c3lqY3N5ZWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MTYwNDMsImV4cCI6MjA1NjM5MjA0M30.1fpVjC12yqbk0HmfTWFij_3xH_n8vzrnWG7LyY3-Vcs' \
    --header 'Content-Type: application/json' \
    --data '{"profile": "{\"first_name\": \"TestFromCurl\", \"last_name\": \"Doe\", \"gender\": \"male\", \"clinic_name\": \"Example Clinic\", \"clinic_street\": \"123 Main St\", \"clinic_city\": \"Vancouver\", \"clinic_postal_code\": \"V6B 2W9\", \"clinic_province\": \"BC\", \"clinic_country\": \"CA\", \"availability\": \"both\"}"}'
    
*/

// Special processing for education field - tries to intelligently split education items
function processEducationField(value: any): string[] {
  const rawArray = ensureArray(value);
  
  // Process each education entry
  const result: string[] = [];
  for (const item of rawArray) {
    // Look for patterns like "Bachelor X at Y, Master Z at W"
    if (item.includes(' at ') && (item.includes('Bachelor') || item.includes('Master') || item.includes('PhD') || item.includes('Diploma'))) {
      // Split by comma if we see degree keywords repeated
      if ((item.match(/Bachelor/g) || []).length > 1 || 
          (item.match(/Master/g) || []).length > 1 || 
          (item.match(/PhD/g) || []).length > 1 ||
          (item.match(/Diploma/g) || []).length > 1) {
        
        // Split by comma and add each part
        const parts = item.split(',').map(p => p.trim()).filter(Boolean);
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
    if ((item.match(/Registered/g) || []).length > 1 || 
        (item.match(/Certified/g) || []).length > 1 || 
        (item.match(/Certificate/g) || []).length > 1) {
      
      // Split by comma and add each part
      const parts = item.split(',').map(p => p.trim()).filter(Boolean);
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
  const combinedText = rawArray.join(', ');
  return combinedText.split(',').map(item => item.trim()).filter(Boolean);
}

// Handle approaches - the database expects a string array, not an object
function processApproachesField(value: any): string[] {
  console.log(`Processing approaches field - Input type: ${typeof value}`);
  if (value === null || value === undefined) {
    console.log("Approaches field is null or undefined");
    return [];
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    console.log(`Approaches is an object: ${JSON.stringify(value)}`);
  } else if (Array.isArray(value)) {
    console.log(`Approaches is already an array of length ${value.length}`);
  } else if (typeof value === 'string') {
    console.log(`Approaches is a string: "${value}"`);
  }
  
  const rawArray = ensureArray(value);
  console.log(`After ensureArray: ${JSON.stringify(rawArray)}`);
  
  // For approaches stored in an object structure, flatten it to array
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // If we have a {long_term: [...]} object structure, extract the array
    if (value.long_term && Array.isArray(value.long_term)) {
      console.log("Found long_term array in approaches object");
      const result = value.long_term.map((item: any) => String(item).trim()).filter(Boolean);
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
        console.log(`Found non-array value in approaches object at key: ${key}`);
        allValues.push(String(value[key]).trim());
      }
    }
    
    console.log(`Extracted ${allValues.length} approaches from object keys`);
    return allValues.filter(Boolean);
  }
  
  // Join all entries, then split by comma for consistent processing
  console.log("Processing approaches as array or string");
  const combinedText = rawArray.join(', ');
  const result = combinedText.split(',').map(item => item.trim()).filter(Boolean);
  console.log(`Final approaches array contains ${result.length} items`);
  return result;
}

// Helper function to find closest match in a list of valid values
function findClosestMatch(value: string, validValues: string[]): string | null {
  if (!value) return null;
  
  // Convert to uppercase for comparison
  const upperValue = value.toUpperCase();
  
  // Direct match after uppercase conversion
  const directMatch = validValues.find(v => v.toUpperCase() === upperValue);
  if (directMatch) return directMatch;
  
  // Check for substring matches
  for (const validValue of validValues) {
    if (upperValue.includes(validValue.toUpperCase()) || 
        validValue.toUpperCase().includes(upperValue)) {
      return validValue;
    }
  }
  
  return null;
}
