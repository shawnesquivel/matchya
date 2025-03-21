import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByRegion, getPopularCitiesByRegion } from "@/app/utils/directoryHelpers";
import {
  isValidCountry,
  isValidRegion,
  getCountryName,
  getRegionName,
  getCityPath,
} from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { country: string; region: string };
  searchParams: { name?: string };
}): Promise<Metadata> {
  const { country, region } = params;
  const { name } = searchParams;

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

export default async function TherapistsRegionPage({
  params,
  searchParams,
}: {
  params: { country: string; region: string };
  searchParams: { page?: string; name?: string };
}) {
  const { country, region } = params;
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();

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

  // Fetch therapists for this region
  const { therapists, totalCount } = await getTherapistsByRegion(
    countryCode,
    regionCode,
    page,
    pageSize,
    searchName
  );

  // Fetch cities in this region
  const cities = await getPopularCitiesByRegion(countryCode, regionCode);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
    { name: regionName, href: `/therapists/browse/${countryCode}/${regionCode}` },
  ];

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}/${regionCode}`;

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          {searchName
            ? `Therapists named "${searchName}" in ${regionName}, ${countryName}`
            : `Therapists in ${regionName}, ${countryName}`}
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-gray-700 mb-8">
              {totalCount > 0
                ? `Browse through ${totalCount} therapists in ${regionName}.`
                : `No therapists found${
                    searchName ? ` matching "${searchName}"` : ""
                  } in ${regionName}.`}
            </p>

            <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />

            <TherapistList
              therapists={therapists}
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
            />
          </div>

          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4">Cities in {regionName}</h2>
            {cities.length > 0 ? (
              <ul className="space-y-2">
                {cities.map((city) => (
                  <li key={city}>
                    <Link
                      href={getCityPath(countryCode, regionCode, city)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {city}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No cities available</p>
            )}
          </div>
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
