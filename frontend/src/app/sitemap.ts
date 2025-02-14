import { MetadataRoute } from "next";
import { generateProfileSlug } from "./utils/pineconeHelpers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL || !API_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC_API_URL must be set.");
}

interface TherapistNamesResponse {
  data: {
    therapistNames: string[];
    lastModified: string;
  };
  debug: {
    count: number;
    timestamp: string;
    hasMore: boolean;
    nextPageToken?: string;
    queryTimeSeconds: number;
    pageSize: number;
    currentPage: string;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const allNames: string[] = [];
    let lastModified: string;
    let pageToken: string | undefined;
    const PAGE_SIZE = 60; // Smaller batch size for testing
    let pageCount = 0;
    const startTime = Date.now();

    console.log("[SITEMAP_NEXT] Starting sitemap generation...");

    // Fetch all pages
    do {
      pageCount++;
      const fetchStartTime = Date.now();

      const url = new URL(`${API_URL}/profile/names-sitemap`);
      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }
      url.searchParams.set("pageSize", PAGE_SIZE.toString());

      console.log(`[SITEMAP_NEXT] Fetching page ${pageCount}:
- URL: ${url.toString()}
- Page token: ${pageToken || "None (first page)"}
- Names collected so far: ${allNames.length}`);

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SITEMAP_NEXT] API Error:
- Status: ${response.status}
- Response: ${errorText}`);
        return []; // Return empty sitemap on error
      }

      const {
        data: { therapistNames, lastModified: newLastModified },
        debug,
      } = (await response.json()) as TherapistNamesResponse;

      const fetchTime = Date.now() - fetchStartTime;

      console.log(`[SITEMAP_NEXT] Page ${pageCount} results:
- Names received: ${therapistNames.length}
- Query time (backend): ${debug.queryTimeSeconds}s
- Fetch time (frontend): ${(fetchTime / 1000).toFixed(2)}s
- Sample names: ${JSON.stringify(therapistNames.slice(0, 3))}...
- Debug info: ${JSON.stringify(debug, null, 2)}`);

      // Keep the most recent lastModified
      lastModified = newLastModified;
      allNames.push(...therapistNames);
      pageToken = debug.nextPageToken;
    } while (pageToken);

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`[SITEMAP_NEXT] Fetch phase complete:
- Total pages: ${pageCount}
- Total names: ${allNames.length}
- Total time: ${totalTime.toFixed(2)}s
- Avg time per page: ${(totalTime / pageCount).toFixed(2)}s`);

    const lastModifiedDate = new Date(parseInt(lastModified!) * 1000);

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
    ] as MetadataRoute.Sitemap;

    // Process all therapist routes in chunks
    const CHUNK_SIZE = 60; // Smaller chunks for testing
    const processStartTime = Date.now();
    let processedCount = 0;

    for (let i = 0; i < allNames.length; i += CHUNK_SIZE) {
      const chunkStartTime = Date.now();
      const chunk = allNames.slice(i, i + CHUNK_SIZE);
      const therapistRoutes = chunk.map((name) => ({
        url: `${BASE_URL}/therapists/${generateProfileSlug(name)}`,
        lastModified: lastModifiedDate,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }));

      processedCount += chunk.length;
      const chunkTime = Date.now() - chunkStartTime;

      console.log(`[SITEMAP_NEXT] Processing chunk ${
        Math.floor(i / CHUNK_SIZE) + 1
      }:
- Processed: ${processedCount}/${allNames.length}
- Chunk time: ${(chunkTime / 1000).toFixed(3)}s
- Sample URLs: ${JSON.stringify(therapistRoutes.slice(0, 2), null, 2)}...`);

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
    console.error(`[SITEMAP_NEXT] Fatal error:`, error);
    return []; // Return empty sitemap on error
  }
}
