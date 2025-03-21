import { Metadata } from "next";
import { notFound } from "next/navigation";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByCity } from "@/app/utils/directoryHelpers";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { country: string; region: string; city: string };
  searchParams: { name?: string };
}): Promise<Metadata> {
  const { country, region, city } = params;
  const { name } = searchParams;

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

export default async function TherapistsCityPage({
  params,
  searchParams,
}: {
  params: { country: string; region: string; city: string };
  searchParams: { page?: string; name?: string };
}) {
  const { country, region, city } = params;
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();
  const citySlug = city.toLowerCase();

  // Convert city slug to display format
  const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1).replace(/-/g, " ");

  // Validate region
  if (!isValidRegion(countryCode, regionCode)) {
    notFound();
  }

  const countryName = getCountryName(countryCode);
  const regionName = getRegionName(countryCode, regionCode);

  // Parse search parameters
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 20;
  const searchName = searchParams.name || "";

  // Fetch therapists for this city
  const { therapists, totalCount } = await getTherapistsByCity(
    countryCode,
    regionCode,
    citySlug,
    page,
    pageSize,
    searchName
  );

  // If no therapists found in this city, show 404
  if (totalCount === 0 && !searchName) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
    { name: regionName, href: `/therapists/browse/${countryCode}/${regionCode}` },
    { name: cityName, href: `/therapists/browse/${countryCode}/${regionCode}/${citySlug}` },
  ];

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}/${regionCode}/${citySlug}`;

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          {searchName
            ? `Therapists named "${searchName}" in ${cityName}, ${regionName}`
            : `Therapists in ${cityName}, ${regionName}`}
        </h1>

        <p className="text-gray-700 mb-8">
          {totalCount > 0
            ? `Browse through ${totalCount} therapists in ${cityName}.`
            : `No therapists found${searchName ? ` matching "${searchName}"` : ""} in ${cityName}.`}
        </p>

        <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />

        <TherapistList
          therapists={therapists}
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
        />
      </div>
    </TherapistDirectoryLayout>
  );
}
