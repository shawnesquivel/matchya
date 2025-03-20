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

  // Contact details
  therapist_email?: string;
  therapist_phone?: string;
  clinic_phone?: string;

  // Additional location details
  clinic_street?: string;
  clinic_postal_code?: string;

  // Verification
  is_verified?: boolean;

  licenses: Array<{
    id: string;
    title: string;
    license_number: string;
    state: string;
    issuing_body: string;
    is_verified?: boolean;
    expiry_date?: string;
    last_verified_date?: string;
  }>;
  fees: Array<{
    id: string;
    session_category: string;
    session_type: string;
    delivery_method: string;
    duration_minutes: number;
    price: number;
    currency: string;
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
  gender: "female" | "male" | "non_binary";
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
  video_intro_link: string | null; // This will be deprecated eventually
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

  // Add the new videos field
  videos?: TherapistVideo[];
}

// Add import for mock data
import {
  mockTherapistProfile,
  shouldUseMockDataForSlug,
} from "./mockTherapistData";

// Update import
import { TherapistVideo } from "../components/VideoEmbed";

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
  nextPageToken?: string;
}> {
  try {
    let url =
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-names-sitemap?pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

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
    return {
      therapistNames: data.data.therapistNames || [],
      nextPageToken: data.debug.nextPageToken,
    };
  } catch (error) {
    console.error("Error fetching therapist names:", error);
    return { therapistNames: [] };
  }
}

/**
 * Generate a URL-friendly slug from a therapist name
 */
export function generateProfileSlug(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .trim(); // Remove leading/trailing whitespace
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
    certifications: profile.certifications || [],
    middle_name: null,
    last_name: profile.last_name,
    bio: profile.bio || "",
    areas_of_focus: profile.areas_of_focus || [],
    education: profile.education || [],
    languages: profile.languages || [],
    profile_img_url: profile.profile_img_url || undefined,
    booking_link: profile.clinic_booking_url,
    approaches: profile.approaches || [],
    clinic_name: profile.clinic_name || "",
    gender:
      (profile.gender?.toLowerCase() === "female"
        ? "female"
        : profile.gender?.toLowerCase() === "male"
        ? "male"
        : "non_binary") as "female" | "male" | "non_binary",
    clinic_profile_url: profile.clinic_profile_url,
    clinic_booking_url: profile.clinic_booking_url,
    licenses: (profile.licenses || []).map((license) => ({
      id: license.id,
      license_number: license.license_number,
      state: license.state,
      title: license.title,
      issuing_body: license.issuing_body || null,
      expiry_date: license.expiry_date || null,
      is_verified: license.is_verified === true,
    })),
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
    clinic_phone: profile.clinic_phone,
    clinic_street: profile.clinic_street,
    clinic_postal_code: profile.clinic_postal_code,
    video_intro_link: profile.video_intro_link,
    initial_price: "",
    subsequent_price: "",
    availability: profile.availability || "both",
    similarity: 0,
    ai_summary: profile.ai_summary,
    clinic_city: profile.clinic_city || "",
    clinic_province: profile.clinic_province || "",
    clinic_country: profile.clinic_country || "",
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
 * Get a therapist profile by name or ID.
 */
export async function getTherapistProfile(
  nameOrId: string,
): Promise<TherapistProfile | null> {
  console.log("getTherapistProfile: fetching for name/id:", nameOrId);

  // Check if this is our test user
  if (
    shouldUseMockDataForSlug(nameOrId) ||
    (nameOrId === "Dr. Emma Thompson" || nameOrId === "Emma Thompson")
  ) {
    console.log(
      "getTherapistProfile: Using mock therapist data for:",
      nameOrId,
    );
    return mockTherapistProfile;
  }

  try {
    // Check if the input looks like a UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        nameOrId,
      );

    if (isUuid) {
      // Use the new ID-based search
      return await fetchTherapistById(nameOrId);
    } else {
      // Use the existing name-based search for URLs/slugs
      const profile = await fetchTherapistProfile(nameOrId);
      if (!profile) {
        console.error("getTherapistProfile: No profile found for:", nameOrId);
        return null;
      }
      return mapSupabaseToTherapistProfile(profile);
    }
  } catch (error) {
    console.error("getTherapistProfile: Error fetching therapist:", error);
    return null;
  }
}
