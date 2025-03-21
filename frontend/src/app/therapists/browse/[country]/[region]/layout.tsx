import { Metadata } from "next";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
}: {
  params: { country: string; region: string };
}): Promise<Metadata> {
  const { country, region } = params;

  // Validate region
  if (!isValidRegion(country.toLowerCase(), region.toLowerCase())) {
    return {
      title: "Region Not Found | Matchya",
      description: "The requested region could not be found.",
    };
  }

  const countryName = getCountryName(country);
  const regionName = getRegionName(country, region);

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
