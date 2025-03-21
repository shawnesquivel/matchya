import { Therapist } from "@/app/contexts/TherapistContext";
import { getRegionDBCode, REGIONS } from "@/app/utils/locationData";

// Interface for the return type of our directory API calls
export interface DirectoryApiResponse {
    therapists: Therapist[];
    totalCount: number;
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
    try {
        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&page=${page}&pageSize=${pageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching therapists by country:", errorData);
            return { therapists: [], totalCount: 0 };
        }

        const data = await response.json();
        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByCountry:", error);
        return { therapists: [], totalCount: 0 };
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
    try {
        // Convert to proper database format
        const regionDBCode = getRegionDBCode(country, region);
        if (!regionDBCode) {
            console.error(`Invalid region: ${region} for country: ${country}`);
            return { therapists: [], totalCount: 0 };
        }

        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&region=${regionDBCode}&page=${page}&pageSize=${pageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching therapists by region:", errorData);
            return { therapists: [], totalCount: 0 };
        }

        const data = await response.json();
        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByRegion:", error);
        return { therapists: [], totalCount: 0 };
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
    try {
        // Convert to proper database format
        const regionDBCode = getRegionDBCode(country, region);
        if (!regionDBCode) {
            console.error(`Invalid region: ${region} for country: ${country}`);
            return { therapists: [], totalCount: 0 };
        }

        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?country=${country.toLowerCase()}&region=${regionDBCode}&city=${city}&page=${page}&pageSize=${pageSize}`;

        // Add name search if provided
        if (name) {
            apiUrl += `&name=${encodeURIComponent(name)}`;
        }

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching therapists by city:", errorData);
            return { therapists: [], totalCount: 0 };
        }

        const data = await response.json();
        return {
            therapists: data.data.therapists || [],
            totalCount: data.data.totalCount || 0,
        };
    } catch (error) {
        console.error("Error in getTherapistsByCity:", error);
        return { therapists: [], totalCount: 0 };
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
        let apiUrl =
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-directory?name=${
                encodeURIComponent(name)
            }&page=${page}&pageSize=${pageSize}`;

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

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error searching therapists by name:", errorData);
            return { therapists: [], totalCount: 0 };
        }

        const data = await response.json();
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

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                next: { revalidate: 86400 }, // Cache for 24 hours
            });

            if (!response.ok) {
                console.warn(
                    `API returned ${response.status}, cities might not be available`,
                );
                return [];
            }

            const data = await response.json();
            return data.data.cities || [];
        } catch (error) {
            console.warn("Error fetching cities from API:", error);
            return [];
        }
    } catch (error) {
        console.error("Error in getPopularCitiesByRegion:", error);
        return [];
    }
}

/**
 * Get a list of regions in a country
 */
export async function getPopularRegions(
    country: string,
): Promise<{ code: string; name: string }[]> {
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

                const response = await fetch(apiUrl, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    next: { revalidate: 86400 }, // Cache for 24 hours
                });

                if (!response.ok) {
                    console.warn(
                        `API returned ${response.status}, using static region data`,
                    );
                    return staticRegions;
                }

                const data = await response.json();
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
        return [];
    }
}
