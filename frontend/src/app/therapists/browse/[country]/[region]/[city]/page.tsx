"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByCity } from "@/app/utils/directoryHelpers";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";
import DirectoryPromoCards from "@/app/components/DirectoryPromoCards";
import { Therapist } from "@/app/contexts/TherapistContext";
import { useSearchParams } from "next/navigation";

export default function TherapistsCityPage({
  params,
}: {
  params: { country: string; region: string; city: string };
}) {
  const { country, region, city: citySlug } = params;
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();
  const searchParams = useSearchParams();

  // Format city name by replacing hyphens with spaces and capitalizing each word
  const cityName = citySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Validate country and region codes
  if (!isValidRegion(countryCode, regionCode)) {
    notFound();
  }

  const countryName = getCountryName(countryCode);
  const regionName = getRegionName(countryCode, regionCode) || regionCode.toUpperCase();

  // Get pagination info from search params
  const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : 1;
  const pageSize = 20; // Default to 20 per page
  const searchName = searchParams.get("name") || "";

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        const result = await getTherapistsByCity(
          countryCode,
          regionCode,
          citySlug,
          page,
          pageSize,
          searchName
        );

        setTherapists(result.therapists);
        setTotalCount(result.totalCount);

        // Check for API error flag
        if (result.apiError) {
          setError(result.errorMessage || "API Error occurred");
          setApiError(true);
        } else {
          setError(null);
          setApiError(false);
        }
      } catch (err) {
        console.error("Error fetching therapists:", err);
        setError("Failed to load therapists. Please try again later.");
        setApiError(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTherapists();
  }, [countryCode, regionCode, citySlug, page, pageSize, searchName]);

  // If no therapists found in this city and no API error, show 404
  if (totalCount === 0 && !searchName && !apiError && !isLoading) {
    notFound();
  }

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}/${regionCode}/${citySlug}`;

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
    { name: regionName, href: `/therapists/browse/${countryCode}/${regionCode}` },
    { name: cityName, href: baseUrl },
  ];

  if (isLoading) {
    return (
      <TherapistDirectoryLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </TherapistDirectoryLayout>
    );
  }

  return (
    <TherapistDirectoryLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />
        <h1 className="text-3xl font-bold mb-2">
          Therapists in {cityName}, {regionName}
        </h1>

        <p className="text-gray-700 mb-8">
          {totalCount > 0
            ? `Browse through ${totalCount} therapists in ${cityName}, ${regionName}.`
            : `No therapists found${
                searchName ? ` matching "${searchName}"` : ""
              } in ${cityName}, ${regionName}.`}
        </p>

        <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />

        <TherapistList
          therapists={therapists}
          isLoading={isLoading}
          totalCount={totalCount}
          apiError={apiError}
          errorMessage={error || ""}
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
        />

        <DirectoryPromoCards />
      </div>
    </TherapistDirectoryLayout>
  );
}
