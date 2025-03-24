import { Metadata } from "next";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
}: {
  params: { country: string; region: string; slug: string };
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
    title: `${regionName}, ${countryName} Therapist Profile | Matchya`,
    description: `View therapist profile in ${regionName}, ${countryName}. Find and connect with qualified mental health professionals who can help you on your journey.`,
    openGraph: {
      title: `${regionName}, ${countryName} Therapist Profile | Matchya`,
      description: `View therapist profile in ${regionName}, ${countryName}. Browse specialties, fees, and book appointments with qualified mental health professionals.`,
      type: "profile",
    },
  };
}

export default function TherapistProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
