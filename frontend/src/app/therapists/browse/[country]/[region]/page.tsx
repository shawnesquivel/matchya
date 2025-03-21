"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Therapist } from "@/app/contexts/TherapistContext";
import { useSearchParams } from "next/navigation";
import DirectoryPromoCards from "@/app/components/DirectoryPromoCards";
import { Metadata } from "next";

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

export default function TherapistsRegionPage({
  params,
}: {
  params: { country: string; region: string };
}) {
  const { country, region } = params;
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();
  const searchParams = useSearchParams();

  // Parse search parameters
  const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : 1;
  const pageSize = 20;
  const searchName = searchParams.get("name") || "";

  // States for client-side data fetching
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [therapistsError, setTherapistsError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Validate region
  if (!isValidRegion(countryCode, regionCode)) {
    notFound();
  }

  const countryName = getCountryName(countryCode);
  const regionName = getRegionName(countryCode, regionCode);

  // Base URL for pagination and search
  const baseUrl = `/therapists/browse/${countryCode}/${regionCode}`;

  // Fetch therapists on component mount and when search params change
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setIsLoadingTherapists(true);
        const result = await getTherapistsByRegion(
          countryCode,
          regionCode,
          page,
          pageSize,
          searchName
        );
        setTherapists(result.therapists);
        setTotalCount(result.totalCount);
        setTherapistsError(null);
      } catch (err) {
        console.error("Error fetching therapists:", err);
        setTherapistsError("Failed to load therapists. Please try again later.");
      } finally {
        setIsLoadingTherapists(false);
      }
    };

    fetchTherapists();
  }, [countryCode, regionCode, page, pageSize, searchName]);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        const citiesData = await getPopularCitiesByRegion(countryCode, regionCode);
        setCities(citiesData);
        setCitiesError(null);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCitiesError("Failed to load cities. Please try again later.");
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [countryCode, regionCode]);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
    { name: regionName, href: `/therapists/browse/${countryCode}/${regionCode}` },
  ];

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          {searchName
            ? `Therapists named "${searchName}" in ${regionName}, ${countryName}`
            : `Therapists in ${regionName}, ${countryName}`}
        </h1>

        {/* Mobile layout: cities + promo cards first */}
        <div className="md:hidden flex flex-col space-y-6 mb-8">
          <div className="bg-white sm:p-6 p-4 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-medium mb-4">Cities in {regionName}</h2>

            {isLoadingCities ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                ))}
              </div>
            ) : citiesError ? (
              <p className="text-red-500">{citiesError}</p>
            ) : cities.length > 0 ? (
              <ul className="space-y-2">
                {cities.map((city) => (
                  <li key={city}>
                    <Link
                      href={getCityPath(countryCode, regionCode, city)}
                      className="text-green animated-link"
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

          <DirectoryPromoCards layout="vertical" />
        </div>

        {/* Desktop layout */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 hidden md:block">
            {isLoadingTherapists ? (
              <div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-8 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : therapistsError ? (
              <div>
                <p className="text-red-500 mb-8">{therapistsError}</p>
                <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />
              </div>
            ) : (
              <>
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
                  baseUrl={
                    searchName ? `${baseUrl}?name=${encodeURIComponent(searchName)}` : baseUrl
                  }
                />
              </>
            )}
          </div>

          <div className="flex flex-col space-y-6 hidden md:flex">
            <div className="bg-white sm:p-6 p-4 rounded-lg shadow-sm h-fit">
              <h2 className="text-xl font-medium mb-4">Cities in {regionName}</h2>

              {isLoadingCities ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  ))}
                </div>
              ) : citiesError ? (
                <p className="text-red-500">{citiesError}</p>
              ) : cities.length > 0 ? (
                <ul className="space-y-2">
                  {cities.map((city) => (
                    <li key={city}>
                      <Link
                        href={getCityPath(countryCode, regionCode, city)}
                        className="text-green animated-link"
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

            <DirectoryPromoCards layout="vertical" />
          </div>
        </div>

        {/* Mobile therapist results - shown after the promo cards */}
        <div className="md:hidden mt-6">
          {isLoadingTherapists ? (
            <div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-8 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : therapistsError ? (
            <div>
              <p className="text-red-500 mb-8">{therapistsError}</p>
              <TherapistNameSearch baseUrl={baseUrl} initialValue={searchName} />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
