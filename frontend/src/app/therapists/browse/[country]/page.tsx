"use client";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import TherapistList from "@/app/components/TherapistList";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import TherapistNameSearch from "@/app/components/TherapistNameSearch";
import { getTherapistsByCountry, getPopularRegions } from "@/app/utils/directoryHelpers";
import { isValidCountry, getCountryName, getRegionPath } from "@/app/utils/locationData";
import { Therapist } from "@/app/contexts/TherapistContext";
import { useSearchParams } from "next/navigation";
import DirectoryPromoCards from "@/app/components/DirectoryPromoCards";

// Component to display regions (loaded client-side)
function RegionsList({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        const regionsData = await getPopularRegions(countryCode);
        setRegions(regionsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError("Failed to load regions. Please try again later.");
        setRegions([]); // Ensure we don't display stale data
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, [countryCode]);

  if (isLoading) {
    return (
      <div className="md:col-span-1 bg-white sm:p-6 p-4 rounded-lg shadow-sm h-fit">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md:col-span-1 bg-white sm:p-6 p-4 rounded-lg shadow-sm h-fit">
        <h2 className="text-xl font-medium mb-4">Regions in {countryName}</h2>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-1 bg-white sm:p-6 p-4 rounded-lg shadow-sm h-fit">
      <h2 className="text-xl font-medium mb-4">Regions in {countryName}</h2>
      {regions.length > 0 ? (
        <ul className="space-y-2">
          {regions.map((region) => (
            <li key={region.code}>
              <Link
                href={getRegionPath(countryCode, region.code)}
                className="text-green animated-link"
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
  );
}

// Component to display therapists list (loaded client-side)
function TherapistResults({
  countryCode,
  countryName,
  page,
  pageSize,
  searchName,
}: {
  countryCode: string;
  countryName: string;
  page: number;
  pageSize: number;
  searchName: string;
}) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoading(true);
        const result = await getTherapistsByCountry(countryCode, page, pageSize, searchName);
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
  }, [countryCode, page, pageSize, searchName]);

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}`;

  if (isLoading) {
    return (
      <div className="md:col-span-2">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-8 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="md:col-span-2">
        <p className="text-red-500 mb-8">{error}</p>
        <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />
      </div>
    );
  }

  return (
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
        isLoading={isLoading}
        totalCount={totalCount}
        apiError={apiError}
        errorMessage={error || ""}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
      />
    </div>
  );
}

async function TherapistsCountryPageInner({
  countryCode,
  countryName,
  page,
  pageSize,
  searchName,
}: {
  countryCode: string;
  countryName: string;
  page: number;
  pageSize: number;
  searchName: string;
}) {
  // Fetch therapists for this country
  const result = await getTherapistsByCountry(countryCode, page, pageSize, searchName);
  const { therapists, totalCount, apiError, errorMessage } = result;

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Therapists in {countryName}</h1>

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
        isLoading={false}
        totalCount={totalCount}
        apiError={!!apiError}
        errorMessage={errorMessage || ""}
        currentPage={page}
        totalPages={Math.ceil(totalCount / pageSize)}
        baseUrl={searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl}
      />

      {/* Popular regions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Popular regions in {countryName}</h2>
        <RegionList countryCode={countryCode} />
      </div>

      <DirectoryPromoCards />
    </div>
  );
}

async function RegionList({ countryCode }: { countryCode: string }) {
  // Get regions for this country
  const regions = await getPopularRegions(countryCode);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {regions.map((region) => (
        <Link
          key={region.code}
          href={`/therapists/browse/${countryCode}/${region.code.toLowerCase()}`}
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          {region.name}
        </Link>
      ))}
    </div>
  );
}

export default function TherapistsCountryPage({
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

  // Get pagination info from search params
  const page = Number(searchParams.page) || 1;
  const pageSize = 20; // Default to 20 per page
  const searchName = searchParams.name || "";

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
  ];

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <TherapistsCountryPageInner
          countryCode={countryCode}
          countryName={countryName}
          page={page}
          pageSize={pageSize}
          searchName={searchName}
        />
      </div>
    </TherapistDirectoryLayout>
  );
}
