import { Metadata } from "next";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams = {},
}: {
  params: { country: string; region: string };
  searchParams?: { name?: string };
}): Promise<Metadata> {
  const { country, region } = params;
  const name = searchParams?.name;

  // Validate region
  if (!isValidRegion(country.toLowerCase(), region.toLowerCase())) {
    return {
      title: "Region Not Found | Matchya",
      description: "The requested region could not be found.",
    };
  }

  const countryName = getCountryName(country);
  const regionName = getRegionName(country, region);

  // Customize metadata based on search term
  if (name) {
    return {
      title: `${name} - Therapists in ${regionName}, ${countryName} | Matchya`,
      description: `Find therapists named ${name} in ${regionName}, ${countryName}. Browse and connect with qualified mental health professionals.`,
      openGraph: {
        title: `${name} - Therapists in ${regionName}, ${countryName} | Matchya`,
        description: `Find therapists named ${name} in ${regionName}, ${countryName}. Browse and connect with qualified mental health professionals.`,
        type: "website",
      },
    };
  }

  return {
    title: `${regionName}, ${countryName} Therapists | Find Mental Health Professionals | Matchya`,
    description: `Browse therapists in ${regionName}, ${countryName}. Find and connect with qualified mental health professionals who can help you on your journey.`,
    openGraph: {
      title: `${regionName}, ${countryName} Therapists | Matchya`,
      description: `Find therapists in ${regionName}, ${countryName}. Browse profiles, specialties, and book appointments with qualified mental health professionals.`,
      type: "website",
    },
  };
}

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
