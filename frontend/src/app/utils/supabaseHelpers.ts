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
  last_name: string;
  title?: string;
  bio: string;
  specialties: string[];
  education: string[];
  experience: Array<{
    position: string;
    organization: string;
    startYear: number;
    endYear?: number;
  }>;
  languages: string[];
  profile_img_url?: string;
  location: {
    city: string;
    province: string;
    country: string;
  };
  available_online: boolean;
  booking_link: string | null;
  approaches: string[];
  short_summary: string;
  qualifications: string[];
  clinic: string;
  gender: string;
  clinic_profile_url?: string | null;
  bio_link?: string | null;
  profile_link?: string | null;
  licenses: Array<{
    id: string;
    title: string;
    license_number: string;
    state: string;
    issuing_body?: string;
    is_verified?: boolean;
    expiry_date?: string;
    last_verified_date?: string;
  }>;
  fees: Array<{
    session_type: string;
    session_category: string;
    delivery_method: string;
    duration_minutes: number;
    price: number;
    currency: string;
  }>;

  // Additional fields from Supabase
  pronouns?: string;
  sexuality?: string[];
  ethnicity?: string[];
  faith?: string[];
  therapist_email?: string;
  therapist_phone?: string;
  clinic_phone?: string;
  clinic_street?: string;
  clinic_postal_code?: string;
  video_intro_link?: string;
  is_verified?: boolean;
  ai_summary?: string;
}

// Add import for mock data
import {
  mockTherapistProfile,
  shouldUseMockDataForSlug,
} from "./mockTherapistData";

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
  // Create a basic experience entry from available data
  const createDefaultExperience = () => {
    return [
      {
        position: profile.title || "Therapist",
        organization: profile.clinic_name || "Private Practice",
        startYear: new Date().getFullYear() - 3,
        endYear: undefined, // Present
      },
    ];
  };

  return {
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    title: profile.title,
    bio: profile.bio || "",
    specialties: profile.areas_of_focus || [],
    education: profile.education || [], // Keep as string array directly from database
    experience: createDefaultExperience(),
    languages: profile.languages || [],
    profile_img_url: profile.profile_img_url || undefined,
    location: {
      city: profile.clinic_city || "",
      province: profile.clinic_province || "",
      country: profile.clinic_country || "",
    },
    available_online: profile.availability === "online" ||
      profile.availability === "both",
    booking_link: profile.clinic_booking_url,
    approaches: profile.approaches || [],
    short_summary: profile.ai_summary || "",
    qualifications: profile.certifications || [],
    clinic: profile.clinic_name || "",
    gender: profile.gender || "",
    clinic_profile_url: profile.clinic_profile_url,
    bio_link: profile.clinic_profile_url,
    profile_link: profile.profile_img_url,
    licenses: profile.licenses || [],
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
    is_verified: profile.is_verified,
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
