"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import { COUNTRIES } from "@/app/utils/locationData";

// Removed the metadata export since it's not compatible with "use client"

export default function TherapistsIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
  ];

  // Handle country selection with loading indicator
  const handleCountrySelect = (countryCode: string) => {
    // Set loading state for the clicked country
    setLoading(countryCode);

    // Navigate to the country page
    router.push(`/therapists/browse/${countryCode}`);
  };

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          Find Therapists by Location
        </h1>

        <p className="text-mblack mb-8">
          Browse our directory of therapists by country. Click on a country to see available regions
          and therapists.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.values(COUNTRIES).map((country) => (
            <div
              key={country.code}
              className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 cursor-pointer ${
                loading === country.code ? "opacity-70" : ""
              }`}
              onClick={() => handleCountrySelect(country.code)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium text-mblack mb-2">{country.displayName}</h2>
                  <p className="text-grey-medium">Browse therapists in {country.displayName}</p>
                </div>

                {loading === country.code && (
                  <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hidden links for SEO and accessibility, while using the client-side router for navigation */}
        <div className="sr-only">
          {Object.values(COUNTRIES).map((country) => (
            <Link key={`link-${country.code}`} href={`/therapists/browse/${country.code}`}>
              Browse therapists in {country.displayName}
            </Link>
          ))}
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
