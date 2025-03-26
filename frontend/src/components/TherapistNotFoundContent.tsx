"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SimilarTherapist {
  id: string;
  first_name: string;
  last_name: string;
  slug: string;
  clinic_country?: string;
  clinic_province?: string;
}

interface TherapistNotFoundContentProps {
  searchedName: string;
}

export default function TherapistNotFoundContent({ searchedName }: TherapistNotFoundContentProps) {
  const [similarTherapists, setSimilarTherapists] = useState<SimilarTherapist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimilarTherapists() {
      // Only search if we have a name to search for
      if (!searchedName) {
        setIsLoading(false);
        console.log("[shared-component] Empty search term, skipping search");
        return;
      }

      setIsLoading(true);
      setApiError(null);
      console.log(
        `[shared-component] Searching for similar therapists with term: "${searchedName}"`
      );

      try {
        // Use profile-search directly
        const apiUrl = `${
          process.env.NEXT_PUBLIC_SUPABASE_URL
        }/functions/v1/profile-search?partialSlug=${encodeURIComponent(searchedName)}`;
        console.log(`[shared-component] Calling API: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

        console.log(`[shared-component] API response status: ${response.status}`);

        // Process the data regardless of status code, as 404 will still contain suggestions
        const data = await response.json();
        console.log(`[shared-component] API response data:`, data);

        if (data.suggestions && data.suggestions.length > 0) {
          console.log(`[shared-component] Found ${data.suggestions.length} similar therapists`);
          setSimilarTherapists(data.suggestions);
        } else {
          // No suggestions found
          console.log(`[shared-component] No similar therapists found`);
          setSimilarTherapists([]);
        }
      } catch (error) {
        console.error("[shared-component] Error fetching similar therapists:", error);
        setApiError("Unable to fetch similar therapists. Please try again later.");
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
        {similarTherapists.length > 0
          ? "We couldn't find the exact therapist you were looking for, but we found similar profiles you might be interested in."
          : "We couldn't find the therapist you're looking for. They may have moved or the profile doesn't exist."}
        {searchedName && (
          <span className="block mt-2 font-medium">Searched for: "{searchedName}"</span>
        )}
      </p>

      {isLoading ? (
        <div className="my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Looking for similar therapists...
          </p>
        </div>
      ) : apiError ? (
        <p className="text-center text-gray-600 mb-6">{apiError}</p>
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
      ) : (
        <p className="text-center text-gray-600 mb-6">Please try browsing all therapists.</p>
      )}

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
