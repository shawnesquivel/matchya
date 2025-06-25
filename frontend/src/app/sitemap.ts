import { MetadataRoute } from "next";
import { fetchTherapistSlugs } from "./utils/supabaseHelpers";
import { COUNTRIES, REGIONS } from "./utils/locationData";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // localhost or https://www.matchya.app

if (!BASE_URL) {
  throw new Error("sitemap.ts: NEXT_PUBLIC_BASE_URL must be set.");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const startTime = Date.now();
  try {
    const allSlugs: {
      slug: string;
      id: string;
      clinic_country: string;
      clinic_province: string;
    }[] = [];
    let pageToken: string | undefined;
    const PAGE_SIZE = 100; // Larger batch size for efficiency
    let pageCount = 0;

    console.log("[SITEMAP_NEXT] Starting sitemap generation with Supabase...");

    // Fetch all pages
    do {
      pageCount++;
      const fetchStartTime = Date.now();

      console.log(`[SITEMAP_NEXT] Fetching page ${pageCount}:
      - Page token: ${pageToken || "None (first page)"}
      - Slugs collected so far: ${allSlugs.length}`);

      const result = await fetchTherapistSlugs(PAGE_SIZE, pageToken);
      if (result.slugs.length > 0) {
        allSlugs.push(...result.slugs);
      }
      pageToken = result.nextPageToken;

      const fetchTime = Date.now() - fetchStartTime;

      console.log(`[SITEMAP_NEXT] Page ${pageCount} results:
      - Slugs received: ${result.slugs.length}
      - Fetch time (frontend): ${(fetchTime / 1000).toFixed(2)}s
      - Sample data: ${JSON.stringify(result.slugs.slice(0, 3))}...`);
    } while (pageToken);

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`[SITEMAP_NEXT] Fetch phase complete:
      - Total pages: ${pageCount}
      - Total slugs: ${allSlugs.length}
      - Total time: ${totalTime.toFixed(2)}s
      - Avg time per page: ${(totalTime / pageCount).toFixed(2)}s`);

    const lastModifiedDate = new Date();

    // Static routes - these rarely change
    const routes = [
      {
        url: BASE_URL,
        lastModified: lastModifiedDate,
        changeFrequency: "daily" as const,
        priority: 1,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: lastModifiedDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: lastModifiedDate,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      // Add therapist directory routes
      {
        url: `${BASE_URL}/therapists/browse`,
        lastModified: lastModifiedDate,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
    ] as MetadataRoute.Sitemap;

    // Add country-level routes
    Object.keys(COUNTRIES).forEach((countryCode) => {
      routes.push({
        url: `${BASE_URL}/therapists/browse/${countryCode}`,
        lastModified: lastModifiedDate,
        changeFrequency: "daily" as const,
        priority: 0.9,
      });

      // Add region-level routes for each country
      if (REGIONS[countryCode]) {
        Object.keys(REGIONS[countryCode]).forEach((regionCode) => {
          routes.push({
            url: `${BASE_URL}/therapists/browse/${countryCode}/${regionCode}`,
            lastModified: lastModifiedDate,
            changeFrequency: "daily" as const,
            priority: 0.9,
          });
        });
      }
    });

    // Process all therapist routes in chunks
    const CHUNK_SIZE = 100; // Larger chunks for efficiency
    const processStartTime = Date.now();
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allSlugs.length; i += CHUNK_SIZE) {
      const chunk = allSlugs.slice(i, i + CHUNK_SIZE);

      const therapistRoutes = chunk.map((item) => {
        // Extract and normalize country/region codes
        let countryCode = item.clinic_country?.toLowerCase() || "ca";
        let regionCode = item.clinic_province?.toLowerCase() || "on";

        // Convert full country/region names to codes if needed
        if (countryCode === "canada") countryCode = "ca";
        if (countryCode === "united states") countryCode = "us";

        // Common province/state conversions
        if (regionCode === "ontario") regionCode = "on";
        if (regionCode === "british columbia") regionCode = "bc";
        if (regionCode === "quebec") regionCode = "qc";
        if (regionCode === "alberta") regionCode = "ab";
        if (regionCode === "california") regionCode = "ca";
        if (regionCode === "new york") regionCode = "ny";

        const url =
          `${BASE_URL}/therapists/${countryCode}/${regionCode}/${item.slug}`;
        return {
          url,
          lastModified: lastModifiedDate,
          changeFrequency: "weekly" as const,
          priority: 0.9,
        };
      });

      processedCount += chunk.length;

      // Only log progress periodically to reduce verbosity
      if (processedCount % 300 === 0 || processedCount === allSlugs.length) {
        console.log(
          `[SITEMAP_NEXT] Progress: ${processedCount}/${allSlugs.length} (${
            Math.round((processedCount / allSlugs.length) * 100)
          }%)`,
        );
      }

      routes.push(...therapistRoutes);
    }

    const totalProcessTime = (Date.now() - processStartTime) / 1000;
    console.log(`[SITEMAP_NEXT] Generation complete:
- Total routes: ${routes.length}
- Processing time: ${totalProcessTime.toFixed(2)}s
- Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s
- Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

    return routes;
  } catch (error) {
    console.error("[SITEMAP_NEXT] Fatal error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      stage: "sitemap generation",
      timeElapsed: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      memoryUsage: `${
        Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      }MB`,
    });
    return []; // Return empty sitemap on error
  }
}
