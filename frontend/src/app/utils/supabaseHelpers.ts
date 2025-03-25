// Interfaces for Supabase data structures
export interface SupabaseTherapistProfile {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  gender: string;
  pronouns: string;
  sexuality: string[];
  ethnicity: string[];
  faith: string[];
  bio: string;
  ai_summary: string;
  profile_img_url: string | null;
  video_intro_link: string | null;
  clinic_name: string;
  clinic_city: string;
  clinic_province: string;
  clinic_country: string;
  clinic_profile_url: string | null;
  clinic_booking_url: string | null;
  availability: string;
  languages: string[];
  education: string[];
  certifications: string[];
  areas_of_focus: string[];
  approaches: string[];
  is_accepting_clients: boolean;

  // Contact details
  therapist_email?: string;
  therapist_phone?: string;
  clinic_phone?: string;

  // Additional location details
  clinic_street?: string;
  clinic_postal_code?: string;

  // Verification
  is_verified?: boolean;

  // Licenses structure matches the database
  licenses: Array<{
    id: string;
    title: string;
    license_number: string;
    state: string;
    issuing_body: string;
    is_verified?: boolean;
    expiry_date?: string | null;
    last_verified_date?: string;
  }>;

  // Fees structure
  fees: Array<{
    id: string;
    session_category: string;
    session_type: string;
    delivery_method: string;
    duration_minutes: number;
    price: number;
    currency: string;
  }>;

  // Videos field
  videos?: Array<{
    id: string;
    url: string;
    platform: "youtube" | "instagram";
    type: "intro" | "faq" | "testimonial";
    title: string | null;
    description: string | null;
    display_order: number;
    is_active: boolean;
  }>;

  // Add the slug field
  slug?: string;

  // Add prompts field to Supabase profile interface
  prompts?: Array<{
    id: string;
    prompt_id: string;
    question: string;
    answer: string;
    category_name: string;
    category_display_name: string;
  }>;
}

// Interface matching the frontend's expected structure
export interface TherapistProfile {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  pronouns: string | null;
  ethnicity: string[];
  gender: string;
  sexuality: string[];
  faith: string[];
  initial_price: string;
  subsequent_price: string;
  availability: string;
  languages: string[];
  areas_of_focus: string[];
  approaches: string[];
  similarity: number;
  ai_summary: string | null;
  bio: string | null;
  profile_img_url: string | null;
  video_intro_link: string | null;
  clinic_profile_url: string | null;
  clinic_booking_url: string | null;
  booking_link: string | null;
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
  is_accepting_clients: boolean;
  licenses: {
    id: string;
    license_number: string;
    state: string;
    title: string;
    issuing_body: string | null;
    expiry_date: string | null;
    is_verified: boolean;
  }[];
  fees: {
    session_type: string;
    session_category: string;
    delivery_method: string;
    duration_minutes: number;
    price: number;
    currency: string;
  }[];

  // Add the videos field
  videos?: TherapistVideo[];
  // Boolean indicating verification status
  is_verified?: boolean;
  // Add the slug field
  slug: string;
  // Add the prompts field
  prompts?: TherapistPrompt[];
}

// Add import for mock data
import {
  mockTherapistProfile,
  shouldUseMockDataForSlug,
} from "./mockTherapistData";

// Update import
import { TherapistVideo } from "../components/VideoEmbed";

// Add a new interface for therapist prompts
export interface TherapistPrompt {
  id: string;
  prompt_id: string;
  question: string;
  answer: string;
  category_name: string;
  category_display_name: string;
}

/**
 * Fetch a therapist profile by name from the Supabase edge function
 */
export async function fetchTherapistProfile(
  nameOrSlug: string,
): Promise<SupabaseTherapistProfile | null> {
  try {
    // Convert slug to name if it's in slug format
    const searchName = nameOrSlug.includes("-")
      ? nameFromSlug(nameOrSlug)
      : nameOrSlug;

    console.log("fetchTherapistProfile: searching for name:", searchName);
    console.log("Original input (nameOrSlug):", nameOrSlug);

    const apiUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-search?name=${
        encodeURIComponent(searchName)
      }`;

    console.log("API URL for profile search:", apiUrl);

    // Call the profile-search edge function
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching therapist profile:", errorData);
      return null;
    }

    const data = await response.json();

    if (!data.data) {
      console.error("No data returned from profile search API");
      return null;
    }

    return data.data as SupabaseTherapistProfile;
  } catch (error) {
    console.error("Error fetching therapist profile:", error);
    return null;
  }
}

/**
 * Fetch therapist names for the sitemap
 */
export async function fetchTherapistNames(
  pageSize: number = 100,
  pageToken?: string,
): Promise<{
  therapistNames: string[];
  therapists?: { name: string; slug: string | null; id?: string }[];
  nextPageToken?: string;
}> {
  try {
    let url =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-names-sitemap?pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    console.log(`Fetching therapist names from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching therapist names:", errorData);
      return { therapistNames: [] };
    }

    const data = await response.json();

    // Log the raw data received from the endpoint
    console.log("Raw response from profile-names-sitemap:");
    console.log(JSON.stringify(data).substring(0, 500) + "...");

    // Extract the nested data structure correctly
    const therapistData = data.data?.therapists || [];
    const therapistNames = data.data?.therapistNames || [];
    const nextPageToken = data.debug?.nextPageToken;

    // Log what we found to debug
    console.log(`Found ${therapistData.length} therapists with data`);
    console.log(
      "Sample therapists:",
      JSON.stringify(therapistData.slice(0, 3)),
    );

    // Validate that each therapist has a proper slug if we found any
    if (therapistData.length > 0) {
      const therapistsWithValidation = therapistData.map(
        (therapist: any) => {
          // Check if slug is in correct format (contains name and ID segment)
          const hasValidSlug = therapist.slug &&
            /^[a-z0-9-]+-[a-z0-9]{6}$/.test(therapist.slug);

          if (!hasValidSlug) {
            console.error(
              `Therapist missing valid slug: ${therapist.name} (${therapist.id})`,
            );
          }

          return therapist;
        },
      );

      return {
        therapistNames: therapistNames,
        therapists: therapistsWithValidation,
        nextPageToken: nextPageToken,
      };
    }

    // Fallback to old format
    return {
      therapistNames: therapistNames,
      nextPageToken: nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching therapist names:", error);
    return { therapistNames: [] };
  }
}

/**
 * Generate a URL-friendly slug from a therapist name
 */
export function generateProfileSlug(
  name: string | null | undefined,
  uuid?: string,
): string {
  if (!name) return "";

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .trim(); // Remove leading/trailing whitespace

  // If UUID is provided, append first 6 characters
  if (uuid && uuid.length >= 6) {
    return `${baseSlug}-${uuid.substring(0, 6)}`;
  }

  return baseSlug;
}

/**
 * Convert a URL slug back to a name format
 */
export function nameFromSlug(slug: string): string {
  // Special case for test-user
  if (shouldUseMockDataForSlug(slug)) {
    return "Dr. Emma Thompson";
  }

  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Transform the Supabase therapist profile into the format expected by the frontend
 */
export function mapSupabaseToTherapistProfile(
  profile: SupabaseTherapistProfile,
): TherapistProfile {
  return {
    id: profile.id,
    first_name: profile.first_name,
    middle_name: null, // No direct mapping
    last_name: profile.last_name,
    bio: profile.bio || "",
    areas_of_focus: profile.areas_of_focus || [],
    education: profile.education || [],
    languages: profile.languages || [],
    profile_img_url: profile.profile_img_url,
    booking_link: profile.clinic_booking_url,
    clinic_booking_url: profile.clinic_booking_url,
    approaches: profile.approaches || [],
    gender: profile.gender,
    clinic_profile_url: profile.clinic_profile_url,
    licenses: profile.licenses?.map((license) => ({
      id: license.id,
      license_number: license.license_number,
      state: license.state,
      title: license.title,
      issuing_body: license.issuing_body || null,
      expiry_date: license.expiry_date || null,
      is_verified: license.is_verified === true,
    })) || [],
    fees: profile.fees?.map((fee) => ({
      session_type: fee.session_type,
      session_category: fee.session_category,
      delivery_method: fee.delivery_method,
      duration_minutes: fee.duration_minutes,
      price: fee.price,
      currency: fee.currency,
    })) || [],
    pronouns: profile.pronouns,
    sexuality: profile.sexuality,
    ethnicity: profile.ethnicity,
    faith: profile.faith,
    therapist_email: profile.therapist_email,
    therapist_phone: profile.therapist_phone,
    clinic_name: profile.clinic_name,
    clinic_street: profile.clinic_street,
    clinic_city: profile.clinic_city,
    clinic_province: profile.clinic_province,
    clinic_postal_code: profile.clinic_postal_code,
    clinic_country: profile.clinic_country,
    clinic_phone: profile.clinic_phone,
    video_intro_link: profile.video_intro_link,
    is_verified: profile.is_verified,
    availability: profile.availability,
    certifications: profile.certifications || [],
    ai_summary: profile.ai_summary,
    videos: profile.videos || [],
    is_accepting_clients: profile.is_accepting_clients === false ? false : true,
    // These are derived values
    initial_price: "",
    subsequent_price: "",
    similarity: 0,
    // Add the slug field - use stored slug or generate one if not available
    slug: profile.slug ||
      generateProfileSlug(
        `${profile.first_name} ${profile.last_name}`,
        profile.id,
      ),
    // Map prompts if they exist
    prompts: profile.prompts || [],
  };
}

/**
 * Fetch a therapist profile by ID from the Supabase edge function
 */
export async function fetchTherapistById(
  id: string,
): Promise<TherapistProfile | null> {
  try {
    console.log("fetchTherapistById: searching for ID:", id);

    const apiUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-id-search?id=${
        encodeURIComponent(id)
      }`;

    console.log("API URL for ID search:", apiUrl);

    // Call the therapist-id-search edge function
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching therapist by ID:", errorData);
      return null;
    }

    const data = await response.json();
    console.log("ID search API response:", data);

    if (!data.data) {
      console.error("No data returned from ID search API");
      return null;
    }

    return data.data as TherapistProfile;
  } catch (error) {
    console.error("Error fetching therapist by ID:", error);
    return null;
  }
}

/**
 * Add a new function to fetch a therapist by slug
 */
export async function fetchTherapistBySlug(
  slug: string,
): Promise<TherapistProfile | null> {
  try {
    console.log("fetchTherapistBySlug: searching for slug:", slug);

    // Strictly validate slug format - must include UUID suffix
    const hasValidFormat = /^[a-z0-9-]+-[a-z0-9]{6}$/.test(slug);

    if (!hasValidFormat) {
      console.error(
        `Invalid slug format: "${slug}" - must be in format "name-xxxxxx" where xxxxxx is the ID prefix`,
      );
      return null; // Immediately fail for invalid slug formats
    }

    // If the slug format is valid, proceed with search
    const apiUrl =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-search?slug=${
        encodeURIComponent(slug)
      }`;

    console.log("API URL for slug search:", apiUrl);

    // Call the profile-search edge function with slug parameter
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching therapist by slug:", errorData);
      return null;
    }

    const data = await response.json();
    if (!data.data) {
      console.error("No data returned from slug search API");
      return null;
    }

    return mapSupabaseToTherapistProfile(data.data as SupabaseTherapistProfile);
  } catch (error) {
    console.error("Error fetching therapist by slug:", error);
    return null;
  }
}

/**
 * Get a therapist profile by name or ID.
 */
export async function getTherapistProfile(
  nameOrSlugOrId: string,
): Promise<TherapistProfile | null> {
  console.log("getTherapistProfile: fetching for:", nameOrSlugOrId);

  // Check if this is our test user
  if (
    shouldUseMockDataForSlug(nameOrSlugOrId) ||
    (nameOrSlugOrId === "Dr. Emma Thompson" ||
      nameOrSlugOrId === "Emma Thompson")
  ) {
    console.log(
      "getTherapistProfile: Using mock therapist data for:",
      nameOrSlugOrId,
    );
    return mockTherapistProfile; // No need to add slug as it's now already in the mock data
  }

  try {
    // Check if the input looks like a UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        nameOrSlugOrId,
      );

    if (isUuid) {
      // Use the new ID-based search
      return await fetchTherapistById(nameOrSlugOrId);
    } else if (nameOrSlugOrId.includes("-")) {
      // Verify it's a proper slug with UUID suffix
      const hasValidSlugFormat = /^[a-z0-9-]+-[a-z0-9]{6}$/.test(
        nameOrSlugOrId,
      );

      if (!hasValidSlugFormat) {
        console.error(
          `getTherapistProfile: Invalid slug format: "${nameOrSlugOrId}"`,
        );
        console.error(
          "Slugs must have format: name-part-xxxxxx where xxxxxx is the ID prefix",
        );
        return null;
      }

      // If valid slug format, use slug-based search
      return await fetchTherapistBySlug(nameOrSlugOrId);
    } else {
      // Use the existing name-based search for URLs/slugs
      const profile = await fetchTherapistProfile(nameOrSlugOrId);
      if (!profile) {
        console.error(
          "getTherapistProfile: No profile found for:",
          nameOrSlugOrId,
        );
        return null;
      }
      return mapSupabaseToTherapistProfile(profile);
    }
  } catch (error) {
    console.error("getTherapistProfile: Error fetching therapist:", error);
    return null;
  }
}

/**
 * Fetch therapist slugs directly for the sitemap
 */
export async function fetchTherapistSlugs(
  pageSize: number = 100,
  pageToken?: string,
): Promise<{
  slugs: {
    slug: string;
    id: string;
    clinic_country: string;
    clinic_province: string;
  }[];
  nextPageToken?: string;
}> {
  try {
    let url =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-slugs?pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    console.log(`Fetching therapist slugs from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching therapist slugs:", errorData);
      return { slugs: [] };
    }

    const data = await response.json();

    // Log what we found to debug
    console.log(`Received ${data.count || 0} valid slugs from endpoint`);
    if (data.slugs?.length > 0) {
      console.log("Sample slugs:", JSON.stringify(data.slugs.slice(0, 3)));
    }

    return {
      slugs: data.slugs || [],
      nextPageToken: data.next_page_token,
    };
  } catch (error) {
    console.error("Error fetching therapist slugs:", error);
    return { slugs: [] };
  }
}
