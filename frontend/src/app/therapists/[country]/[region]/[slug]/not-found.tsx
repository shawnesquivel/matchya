"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SimilarTherapist {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  clinic_country?: string;
  clinic_province?: string;
}

export default function TherapistNotFound() {
  const searchParams = useSearchParams();
  const [similarTherapists, setSimilarTherapists] = useState<SimilarTherapist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get search term from URL parameters
  const searchedName = searchParams.get("q") || "";

  useEffect(() => {
    async function fetchSimilarTherapists() {
      // Only search if we have a name to search for
      if (!searchedName) return;

      setIsLoading(true);

      try {
        // Call the profile-search edge function with partialSlug parameter
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile-search?partialSlug=${searchedName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          setSimilarTherapists(data.suggestions);
        }
      } catch (error) {
        console.error("Error fetching similar therapists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSimilarTherapists();
  }, [searchedName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <h1 className="text-3xl font-semibold mb-4 text-center">Therapist Not Found</h1>
      <p className="text-center text-gray-600 mb-8 max-w-md">
        We couldn't find the therapist you're looking for. They may have moved or the profile
        doesn't exist.
      </p>

      {isLoading ? (
        <div className="my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Looking for similar therapists...
          </p>
        </div>
      ) : similarTherapists.length > 0 ? (
        <div className="my-6 w-full max-w-md">
          <h2 className="text-xl font-medium mb-4 text-center">You might be looking for:</h2>
          <div className="space-y-3">
            {similarTherapists.map((therapist) => (
              <Link
                key={therapist.id}
                href={`/therapists/${(therapist.clinic_country || "ca").toLowerCase()}/${(
                  therapist.clinic_province || "bc"
                ).toLowerCase()}/${therapist.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                <div className="font-medium">
                  {therapist.first_name} {therapist.last_name}
                </div>
                <div className="text-sm text-gray-500 mt-1">View profile</div>
              </Link>
            ))}
          </div>
        </div>
      ) : searchedName ? (
        <p className="text-center text-gray-600 mb-6">No similar therapists found.</p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/therapists/browse"
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
        >
          Browse All Therapists
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
