import { Metadata } from "next";
import Link from "next/link";
import TherapistDirectoryLayout from "@/app/components/TherapistDirectoryLayout";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";
import { COUNTRIES } from "@/app/utils/locationData";

// Define metadata
export const metadata: Metadata = {
  title: "Find Therapists by Location | Matchya",
  description:
    "Browse therapists by country and region. Find and connect with qualified mental health professionals across Canada and the US.",
};

export default function TherapistsIndexPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
  ];

  return (
    <TherapistDirectoryLayout>
      <div className="container mx-auto px-4 py-8">
        <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />

        <h1 className="text-3xl font-new-spirit font-light mt-6 mb-8">
          Find Therapists by Location
        </h1>

        <p className="text-gray-700 mb-8">
          Browse our directory of therapists by country. Click on a country to see available regions
          and therapists.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.values(COUNTRIES).map((country) => (
            <Link
              key={country.code}
              href={`/therapists/browse/${country.code}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{country.displayName}</h2>
              <p className="text-gray-600">Browse therapists in {country.displayName}</p>
            </Link>
          ))}
        </div>
      </div>
    </TherapistDirectoryLayout>
  );
}
