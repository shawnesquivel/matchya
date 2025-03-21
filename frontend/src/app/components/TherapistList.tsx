"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Therapist } from "@/app/contexts/TherapistContext";
import { generateProfileSlug } from "@/app/utils/supabaseHelpers";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import TherapistPagination from "@/app/components/TherapistPagination";

interface TherapistListProps {
  therapists: Therapist[];
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function TherapistList({
  therapists,
  currentPage,
  totalPages,
  baseUrl,
}: TherapistListProps) {
  if (!therapists || therapists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No therapists found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map((therapist) => {
          const profileSlug = generateProfileSlug(`${therapist.first_name} ${therapist.last_name}`);

          return (
            <Link
              href={`/therapists/${profileSlug}`}
              key={therapist.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-4 flex items-start space-x-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  {therapist.profile_img_url ? (
                    <Image
                      src={getSafeImageUrl(therapist.profile_img_url)}
                      alt={`${therapist.first_name} ${therapist.last_name}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-beige h-full w-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">
                        {therapist.first_name[0]}
                        {therapist.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {therapist.first_name} {therapist.last_name}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {therapist.licenses && therapist.licenses.length > 0
                      ? therapist.licenses[0].title
                      : "Therapist"}
                  </p>

                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      {therapist.clinic_city}, {therapist.clinic_province}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {therapist.areas_of_focus &&
                    therapist.areas_of_focus.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="inline-block bg-beige-extralight text-gray-700 px-2 py-1 text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  {therapist.areas_of_focus && therapist.areas_of_focus.length > 3 && (
                    <span className="inline-block text-gray-500 text-xs px-2 py-1">
                      +{therapist.areas_of_focus.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <TherapistPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </div>
      )}
    </div>
  );
}
