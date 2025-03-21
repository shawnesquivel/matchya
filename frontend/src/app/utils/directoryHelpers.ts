import { Therapist } from "@/app/contexts/TherapistContext";
import { getRegionDBCode, REGIONS } from "@/app/utils/locationData";
import {
  getMockTherapistsByCountry,
  getMockTherapistsByRegion,
  getMockTherapistsByCity,
  getMockRegionsByCountry,
  getMockCitiesByRegion,
  isMockDataEnabled
} from "./mockDirectoryData";

// Interface for the return type of our directory API calls
export interface DirectoryApiResponse {
    therapists: Therapist[];
    totalCount: number;
}

// Cache for directory data to avoid duplicate requests
const directoryCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Optimized fetch helper with caching
 */
async function fetchWithCache(url: string, options?: RequestInit, cacheTTL: number = CACHE_TTL) {
    // Generate cache key from URL
    const cacheKey = url;
    
    // Check cache first
    const cachedItem = directoryCache.get(cacheKey);
    const now = Date.now();
    
    if (cachedItem && (now - cachedItem.timestamp < cacheTTL)) {
        console.log(`[Cache hit] Using cached data for: ${url.substring(0, 100)}...`);
        return cachedItem.data;
    }
    
    // Not in cache or expired, make the request
    try {
        console.log(`[API Request] Fetching: ${url.substring(0, 100)}...`);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching from API (${response.status}): ${errorText.substring(0, 100)}`);
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store in cache
        directoryCache.set(cacheKey, { data, timestamp: now });
        
        return data;
    } catch (error) {
        console.error(`[fetchWithCache] Error:`, error);
        throw error;
    }
}

/**
 * Fetch therapists by country
 */
export async function getTherapistsByCountry(
    country: string,
    page: number = 1,
    pageSize: number = 20,
    name?: string,
): Promise<DirectoryApiResponse> {
    // Use mock data during development if database isn't available
    if (isMockDataEnabled()) {
        return getMockTherapistsByCountry(country, page, pageSize, name);
    }
    
    try {
        // Optimize page size for faster initial load on first page
        const actualPageSize = page === 1 ? Math.min(pageSize, 10) : pageSize;
        
        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&page=${page}&pageSize=${actualPageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            // Cache control to help with browser caching
            next: { revalidate: 3600 }, // Cache for 1 hour
        };
        
        const data = await fetchWithCache(apiUrl, options);
        
        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByCountry:", error);
        // Fallback to mock data if there's an error
        return getMockTherapistsByCountry(country, page, pageSize, name);
    }
}

/**
 * Fetch therapists by region (province or state) with pagination
 */
export async function getTherapistsByRegion(
    country: string,
    region: string,
    page: number = 1,
    pageSize: number = 20,
    name?: string,
): Promise<DirectoryApiResponse> {
    // Use mock data during development if database isn't available
    if (isMockDataEnabled()) {
        return getMockTherapistsByRegion(country, region, page, pageSize, name);
    }
    
    try {
        // Convert to proper database format
        const regionDBCode = getRegionDBCode(country, region);
        if (!regionDBCode) {
            console.error(`Invalid region: ${region} for country: ${country}`);
            return { therapists: [], totalCount: 0 };
        }

        // Optimize page size for faster initial load on first page
        const actualPageSize = page === 1 ? Math.min(pageSize, 10) : pageSize;

        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&region=${regionDBCode}&page=${page}&pageSize=${actualPageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        };
        
        const data = await fetchWithCache(apiUrl, options);

        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByRegion:", error);
        // Fallback to mock data if there's an error
        return getMockTherapistsByRegion(country, region, page, pageSize, name);
    }
}

/**
 * Fetch therapists by city with pagination
 */
export async function getTherapistsByCity(
    country: string,
    region: string,
    city: string,
    page: number = 1,
    pageSize: number = 20,
    name?: string,
): Promise<DirectoryApiResponse> {
    // Use mock data during development if database isn't available
    if (isMockDataEnabled()) {
        return getMockTherapistsByCity(country, region, city, page, pageSize, name);
    }
    
    try {
        // Convert to proper database format
        const regionDBCode = getRegionDBCode(country, region);
        if (!regionDBCode) {
            console.error(`Invalid region: ${region} for country: ${country}`);
            return { therapists: [], totalCount: 0 };
        }

        // Optimize page size for faster initial load on first page
        const actualPageSize = page === 1 ? Math.min(pageSize, 10) : pageSize;

        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&region=${regionDBCode}&city=${city}&page=${page}&pageSize=${actualPageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        };
        
        const data = await fetchWithCache(apiUrl, options);
        
        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByCity:", error);
        // Fallback to mock data if there's an error
        return getMockTherapistsByCity(country, region, city, page, pageSize, name);
    }
}

/**
 * Fetch therapists by name search with pagination
 */
export async function searchTherapistsByName(
    name: string,
    country?: string,
    region?: string,
    city?: string,
    page: number = 1,
    pageSize: number = 20,
): Promise<DirectoryApiResponse> {
    try {
        // Optimize page size for faster initial load
        const actualPageSize = page === 1 ? Math.min(pageSize, 10) : pageSize;
        
        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?name=${
                encodeURIComponent(name)
            }&page=${page}&pageSize=${actualPageSize}`;

        if (country) {
            apiUrl += `&country=${country.toLowerCase()}`;
        }

        if (region) {
            // Convert to proper database format if country is provided
            const regionDBCode = country
                ? getRegionDBCode(country, region)
                : region;
            apiUrl += `&region=${regionDBCode}`;
        }

        if (city) {
            apiUrl += `&city=${city}`;
        }

        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        };
        
        const data = await fetchWithCache(apiUrl, options);

        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in searchTherapistsByName:", error);
        return { therapists: [], totalCount: 0 };
    }
}

/**
 * Get a list of popular cities in a region
 */
export async function getPopularCitiesByRegion(
    country: string,
    region: string,
): Promise<string[]> {
    // Use mock data during development if database isn't available
    if (isMockDataEnabled()) {
        return getMockCitiesByRegion(country, region);
    }
    
    try {
        // Convert to proper database format
        const regionDBCode = getRegionDBCode(country, region);
        if (!regionDBCode) {
            console.error(`Invalid region: ${region} for country: ${country}`);
            return [];
        }

        try {
            const apiUrl =
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory-cities?country=${country.toLowerCase()}&region=${regionDBCode}`;

            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                next: { revalidate: 86400 }, // Cache for 24 hours
            };
            
            // Use longer cache TTL for cities (24 hours)
            const data = await fetchWithCache(apiUrl, options, 24 * 60 * 60 * 1000);
            return data.data.cities || [];
        } catch (error) {
            console.warn("Error fetching cities from API:", error);
            return [];
        }
    } catch (error) {
        console.error("Error in getPopularCitiesByRegion:", error);
        // Fallback to mock data if there's an error
        return getMockCitiesByRegion(country, region);
    }
}

/**
 * Get a list of regions in a country
 */
export async function getPopularRegions(
    country: string,
): Promise<{ code: string; name: string }[]> {
    // Use mock data during development if database isn't available
    if (isMockDataEnabled()) {
        return getMockRegionsByCountry(country);
    }
    
    try {
        // First try to get from static data as fallback
        const countryLower = country.toLowerCase();
        if (REGIONS[countryLower]) {
            // Convert static region data to the expected format
            const staticRegions = Object.values(REGIONS[countryLower]).map(
                (region) => ({
                    code: (region as any).code,
                    name: (region as any).displayName,
                }),
            );

            // Try to get from API but use static data as fallback
            try {
                const apiUrl =
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory-regions?country=${countryLower}`;

                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    next: { revalidate: 86400 }, // Cache for 24 hours
                };
                
                // Use longer cache TTL for regions (24 hours)
                const data = await fetchWithCache(apiUrl, options, 24 * 60 * 60 * 1000);
                return data.data.regions || staticRegions;
            } catch (error) {
                console.warn(
                    "Error fetching regions from API, using static data:",
                    error,
                );
                return staticRegions;
            }
        }

        // If country not in static data, return empty
        console.error(`No static region data for country: ${country}`);
        return [];
    } catch (error) {
        console.error("Error in getPopularRegions:", error);
        // Fallback to mock data if there's an error
        return getMockRegionsByCountry(country);
    }
}
