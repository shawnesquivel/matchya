import { MetadataRoute } from "next";
import { generateProfileSlug } from "./utils/pineconeHelpers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL || !API_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC_API_URL must be set");
}

interface TherapistNamesResponse {
  data: {
    names: string[];
  };
  debug: {
    count: number;
    timestamp: string;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch therapist names
    const response = await fetch(`${API_URL}/profile/names`);
    if (!response.ok) {
      console.error("Failed to fetch names:", await response.text());
      return []; // Return empty sitemap on error
    }

    const {
      data: { names },
    } = (await response.json()) as TherapistNamesResponse;
    console.log(`Building sitemap for ${names.length} therapists`);

    // Static routes
    const routes = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ] as MetadataRoute.Sitemap;

    // Add therapist profile routes using generateProfileSlug
    const therapistRoutes = names.map((name) => ({
      url: `${BASE_URL}/therapists/${generateProfileSlug(name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...routes, ...therapistRoutes];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return []; // Return empty sitemap on error
  }
}
