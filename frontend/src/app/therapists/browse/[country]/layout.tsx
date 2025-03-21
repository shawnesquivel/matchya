import { Metadata } from "next";
import { isValidCountry, getCountryName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams = {},
}: {
  params: { country: string };
  searchParams?: { name?: string };
}): Promise<Metadata> {
  const { country } = params;
  const name = searchParams?.name;

  // Validate country code
  if (!isValidCountry(country.toLowerCase())) {
    return {
      title: "Country Not Found | Matchya",
      description: "The requested country could not be found.",
    };
  }

  const countryName = getCountryName(country);

  // Customize metadata based on search term
  if (name) {
    return {
      title: `${name} - Therapists in ${countryName} | Matchya`,
      description: `Find therapists named ${name} in ${countryName}. Browse and connect with qualified mental health professionals.`,
      openGraph: {
        title: `${name} - Therapists in ${countryName} | Matchya`,
        description: `Find therapists named ${name} in ${countryName}. Browse and connect with qualified mental health professionals.`,
        type: "website",
      },
    };
  }

  return {
    title: `${countryName} Therapists | Find Mental Health Professionals | Matchya`,
    description: `Browse therapists in ${countryName}. Find and connect with qualified mental health professionals who can help you on your journey.`,
    openGraph: {
      title: `${countryName} Therapists | Matchya`,
      description: `Find therapists in ${countryName}. Browse profiles, specialties, and book appointments with qualified mental health professionals.`,
      type: "website",
    },
  };
}

export default function CountryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
