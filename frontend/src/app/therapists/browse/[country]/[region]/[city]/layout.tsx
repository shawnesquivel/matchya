import { Metadata } from "next";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams = {},
}: {
  params: { country: string; region: string; city: string };
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const { country, region, city } = params;
  // Handle name search parameter with extra safeguards against undefined
  const nameParam = searchParams?.name;
  const name =
    typeof nameParam === "string" ? nameParam : Array.isArray(nameParam) ? nameParam[0] : "";

  // Validate region
  if (!isValidRegion(country.toLowerCase(), region.toLowerCase())) {
    return {
      title: "Location Not Found | Matchya",
      description: "The requested location could not be found.",
    };
  }

  const countryName = getCountryName(country);
  const regionName = getRegionName(country, region);
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, " ");

  // Customize metadata based on search term
  if (name) {
    return {
      title: `${name} - Therapists in ${cityName}, ${regionName} | Matchya`,
      description: `Find therapists named ${name} in ${cityName}, ${regionName}. Browse and connect with qualified mental health professionals.`,
      openGraph: {
        title: `${name} - Therapists in ${cityName}, ${regionName} | Matchya`,
        description: `Find therapists named ${name} in ${cityName}, ${regionName}. Browse and connect with qualified mental health professionals.`,
        type: "website",
      },
    };
  }

  return {
    title: `${cityName}, ${regionName} Therapists | Find Mental Health Professionals | Matchya`,
    description: `Browse therapists in ${cityName}, ${regionName}. Find and connect with qualified mental health professionals who can help you on your journey.`,
    openGraph: {
      title: `${cityName}, ${regionName} Therapists | Matchya`,
      description: `Find therapists in ${cityName}, ${regionName}. Browse profiles, specialties, and book appointments with qualified mental health professionals.`,
      type: "website",
    },
  };
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
