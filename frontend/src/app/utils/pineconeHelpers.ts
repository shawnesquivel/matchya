export interface PineconeTherapistProfile {
  clerk_user_id?: string;
  name: string;
  title?: string;
  gender?: string;
  bio: string;
  short_summary?: string;
  summary?: string;
  location: string;
  country: string;
  clinic?: string;
  available_online: boolean;
  languages: string[];
  qualifications: string[];
  specialties: string[];
  approaches: string[];
  mental_health_role: string;
  license_number?: string;
  license_province?: string;
  license_expiration_month?: string;
  license_expiration_year?: string;
  fees: {
    individual_50min: number | null;
    individual_80min: number | null;
    couples_50min: number | null;
    couples_80min: number | null;
    sliding_scale: boolean;
    sliding_scale_details: string;
  };
  email?: string;
  bio_link?: string;
  booking_link?: string;
  profile_link?: string;
  insurance: {
    direct_billing: boolean;
    accepted_providers: string[];
    direct_billing_providers: string[];
  };
}

export interface TherapistProfile {
  name: string;
  title?: string;
  bio: string;
  specialties: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: Array<{
    position: string;
    organization: string;
    startYear: number;
    endYear?: number;
  }>;
  languages: string[];
  insuranceAccepted: string[];
  sessionTypes: string[];
  rates: {
    initial: number;
    ongoing: number;
  };
  imageUrl?: string;
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
  fees: string[];
  country: string;
  bio_link?: string;
  profile_link?: string;
  summary?: string;
}

// Main function - maintains backward compatibility
export async function fetchPineconeProfile(identifier: string): Promise<any> {
  try {
    console.log("=== FETCH PINECONE PROFILE START ===");
    console.log("Input identifier:", identifier);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not set");
      return null;
    }

    // Try bio_link first if it's a URL
    if (identifier.startsWith("http")) {
      const bioLinkResponse = await fetch(
        `${apiUrl}/profile?bio_link=${encodeURIComponent(identifier)}`
      );
      const bioLinkData = await bioLinkResponse.json();
      console.log("Bio link response:", {
        status: bioLinkResponse.status,
        ok: bioLinkResponse.ok,
        data: bioLinkData,
      });
      if (bioLinkResponse.ok && bioLinkData?.data) {
        console.log("Found profile by bio_link");
        return bioLinkData.data;
      }
    }

    // If not found by bio_link or not a URL, try name search
    console.log("Attempting name search:", identifier);
    const url = `${apiUrl}/profile/search?name=${encodeURIComponent(
      identifier
    )}`;
    console.log("URL:", url);
    const nameResponse = await fetch(url);
    console.log("API URL:", apiUrl);
    const nameData = await nameResponse.json();
    console.log("Name search response:", {
      status: nameResponse.status,
      ok: nameResponse.ok,
      data: nameData,
      debug: nameData?.debug,
    });

    if (nameResponse.ok && nameData?.data) {
      console.log("Found profile by name");
      return nameData.data;
    }

    console.log("Profile not found:", {
      identifier,
      lastAttemptedEndpoint: "profile/search",
      lastResponseStatus: nameResponse.status,
      lastResponseData: nameData,
    });
    return null;
  } catch (error) {
    console.error("Profile fetch error:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      identifier,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  } finally {
    console.log("=== FETCH PINECONE PROFILE END ===");
  }
}

export function generateProfileSlug(name: string): string {
  return name
    .normalize("NFKD") // Normalize Unicode characters
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s.-]/g, "") // Keep periods and dashes
    .replace(/\s+/g, "-") // Convert spaces to dashes
    .replace(/-+/g, "-") // Clean up multiple dashes
    .trim();
}

export function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => {
      // Special case for "Dr."
      if (word === "dr") return "Dr.";
      // Handle middle initials
      if (word.length === 1) return word.toUpperCase() + ".";
      // Normal words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function mapPineconeToTherapistProfile(profile: any): TherapistProfile {
  if (!profile) {
    throw new Error("Profile data is required");
  }

  console.log("Raw Pinecone profile:", profile); // Debug log

  return {
    name: profile.name || "",
    title: profile.title || "Therapist",
    bio: profile.bio || "",
    specialties: profile.specialties || [],
    education: (profile.qualifications || []).map((qual: string) => {
      const match = qual.match(/(.+) from (.+) \((\d{4})\)/);
      return match
        ? {
            degree: match[1],
            institution: match[2],
            year: parseInt(match[3], 10),
          }
        : {
            degree: qual,
            institution: "Unknown",
            year: new Date().getFullYear(),
          };
    }),
    experience: [],
    languages: profile.languages || [],
    insuranceAccepted: profile.insurance?.accepted_providers || [],
    sessionTypes: [
      profile.available_online ? "Virtual" : null,
      "In-person",
    ].filter(Boolean) as string[],
    rates: {
      initial: profile.fees?.individual_50min || 0,
      ongoing: profile.fees?.individual_80min || 0,
    },
    imageUrl: profile.profile_link,
    location: {
      city: profile.location || "",
      province: profile.license_province || "",
      country: profile.country || "",
    },
    clinic: profile.clinic || "",
    gender: profile.gender || "",
    fees: Array.isArray(profile.fees) ? profile.fees : [],
    approaches: profile.approaches || [],
    short_summary: profile.short_summary || "",
    qualifications: profile.qualifications || [],
    booking_link: profile.booking_link || null,
    available_online: Boolean(profile.available_online),
    country: profile.country || "",
    bio_link: profile.bio_link || null,
    profile_link: profile.profile_link || null,
    summary: profile.summary || "",
  };
}

// For backward compatibility with .js version
export const updatePineconeProfileSubscription = async (
  clerkUserId: string,
  stripeCustomerId: string,
  subscriptionId: string
): Promise<Response> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }

  const response = await fetch(`${apiUrl}/profile/subscribe`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      stripeCustomerId,
      subscriptionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};
