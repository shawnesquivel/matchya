// Define country codes and names
export const COUNTRIES = {
    ca: { code: "ca", name: "Canada", displayName: "Canada" },
    us: { code: "us", name: "United States", displayName: "United States" },
};

// Define region codes and names by country
export const REGIONS = {
    ca: {
        bc: {
            code: "bc",
            name: "British Columbia",
            country: "ca",
            displayName: "British Columbia",
        },
        on: {
            code: "on",
            name: "Ontario",
            country: "ca",
            displayName: "Ontario",
        },
    },
    us: {
        ca: {
            code: "ca",
            name: "California",
            country: "us",
            displayName: "California",
        },
        ny: {
            code: "ny",
            name: "New York",
            country: "us",
            displayName: "New York",
        },
    },
};

// Helper function to validate country
export function isValidCountry(countryCode: string): boolean {
    return Object.keys(COUNTRIES).includes(countryCode.toLowerCase());
}

// Helper function to validate region
export function isValidRegion(
    countryCode: string,
    regionCode: string,
): boolean {
    const country = countryCode.toLowerCase();
    const region = regionCode.toLowerCase();

    return isValidCountry(country) &&
        Object.keys(REGIONS[country]).includes(region);
}

// Helper function to get country display name
export function getCountryName(countryCode: string): string {
    const country = countryCode.toLowerCase();
    return isValidCountry(country) ? COUNTRIES[country].displayName : "";
}

// Helper function to get region display name
export function getRegionName(countryCode: string, regionCode: string): string {
    const country = countryCode.toLowerCase();
    const region = regionCode.toLowerCase();

    if (isValidRegion(country, region)) {
        return REGIONS[country][region].displayName;
    }

    return "";
}

// Helper function to get all regions for a country
export function getRegions(countryCode: string): any[] {
    const country = countryCode.toLowerCase();

    if (!isValidCountry(country)) {
        return [];
    }

    return Object.values(REGIONS[country]);
}

// Convert province/state code to database format
export function getRegionDBCode(
    countryCode: string,
    regionCode: string,
): string {
    const country = countryCode.toLowerCase();
    const region = regionCode.toLowerCase();

    if (!isValidRegion(country, region)) {
        return "";
    }

    // For Canada, convert to uppercase for database format
    if (country === "ca") {
        return region.toUpperCase();
    }

    // For US, keep the format that matches the database
    if (country === "us") {
        return region.toUpperCase();
    }

    return "";
}

// Generate URL paths for locations
export function getCountryPath(countryCode: string): string {
    const country = countryCode.toLowerCase();
    return isValidCountry(country) ? `/therapists/browse/${country}` : "";
}

export function getRegionPath(countryCode: string, regionCode: string): string {
    const country = countryCode.toLowerCase();
    const region = regionCode.toLowerCase();

    if (isValidRegion(country, region)) {
        return `/therapists/browse/${country}/${region}`;
    }

    return "";
}

export function getCityPath(
    countryCode: string,
    regionCode: string,
    city: string,
): string {
    const country = countryCode.toLowerCase();
    const region = regionCode.toLowerCase();

    if (isValidRegion(country, region) && city) {
        const citySlug = city.toLowerCase().replace(/\s+/g, "-");
        return `/therapists/browse/${country}/${region}/${citySlug}`;
    }

    return "";
}
