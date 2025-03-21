import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByCountry, getPopularRegions } from "@/app/utils/directoryHelpers";
import { isValidCountry, getCountryName, getRegionPath } from "@/app/utils/locationData";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { country: string };
  searchParams: { name?: string };
}): Promise<Metadata> {
  const { country } = params;
  const { name } = searchParams;

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

// This prepares the path for static generation
export async function generateStaticParams() {
  return ["ca", "us"].map((country) => ({
    country,
  }));
}

export default async function TherapistsCountryPage({
  params,
  searchParams,
}: {
  params: { country: string };
  searchParams: { page?: string; name?: string };
}) {
  const { country } = params;
  const countryCode = country.toLowerCase();

  // Validate country code
  if (!isValidCountry(countryCode)) {
    notFound();
  }

  const countryName = getCountryName(countryCode);

  // Parse search parameters
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 20;
  const searchName = searchParams.name || "";

  // Fetch therapists for this country
  const { therapists, totalCount } = await getTherapistsByCountry(
    countryCode,
    page,
    pageSize,
    searchName
  );

  // Fetch regions in this country
  const regions = await getPopularRegions(countryCode);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
  ];

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}`;

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          {searchName
            ? `Therapists named "${searchName}" in ${countryName}`
            : `Therapists in ${countryName}`}
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-gray-700 mb-8">
              {totalCount > 0
                ? `Browse through ${totalCount} therapists in ${countryName}.`
                : `No therapists found${
                    searchName ? ` matching "${searchName}"` : ""
                  } in ${countryName}.`}
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
            <h2 className="text-xl font-semibold mb-4">Regions in {countryName}</h2>
            {regions.length > 0 ? (
              <ul className="space-y-2">
                {regions.map((region) => (
                  <li key={region.code}>
                    <Link
                      href={getRegionPath(countryCode, region.code)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {region.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No regions available</p>
            )}
          </div>
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
