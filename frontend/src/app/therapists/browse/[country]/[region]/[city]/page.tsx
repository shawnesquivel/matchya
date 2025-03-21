import { notFound } from "next/navigation";
import Link from "next/link";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByCity } from "@/app/utils/directoryHelpers";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";
import DirectoryPromoCards from "@/app/components/DirectoryPromoCards";

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

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-3">
          {searchName
            ? `Therapists named "${searchName}" in ${cityName}, ${regionName}`
            : `Therapists in ${cityName}, ${regionName}`}
        </h1>

        {/* Mobile layout: promo cards first */}
        <div className="md:hidden mb-8">
          <DirectoryPromoCards layout="horizontal" />
        </div>

        <div>
          <p className="text-gray-700 mb-8">
            {totalCount > 0
              ? `Browse through ${totalCount} therapists in ${cityName}.`
              : `No therapists found${
                  searchName ? ` matching "${searchName}"` : ""
                } in ${cityName}.`}
          </p>

          <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />

          <TherapistList
            therapists={therapists}
            currentPage={page}
            totalPages={Math.ceil(totalCount / pageSize)}
            baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
          />

          {/* Desktop-only promo cards below therapist list */}
          <div className="hidden md:block mt-12">
            <DirectoryPromoCards layout="horizontal" />
          </div>
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
