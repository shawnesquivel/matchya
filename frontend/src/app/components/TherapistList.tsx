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
      <div className="grid grid-cols-1 md:grid-cols-2 sm:gap-6 gap-3">
        {therapists.map((therapist) => {
          const profileSlug = generateProfileSlug(`${therapist.first_name} ${therapist.last_name}`);

          return (
            <Link
              href={`/therapists/${profileSlug}`}
              key={therapist.id}
              target="_blank"
              className="bg-white rounded-lg hover:shadow-sm transition-shadow duration-300 overflow-hidden flex flex-col justify-between border border-grey-light hover:border-beige-dark group relative"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full text-sm font-medium text-green">
                View Profile
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>

              <div className="p-4 flex flex-col items-start gap-4">
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
                  <div className="flex gap-2">
                    <h2 className="text-2xl font-light font-new-spirit text-mblack">
                      {therapist.first_name} {therapist.last_name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2.5">{therapist.pronouns}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {therapist.licenses && therapist.licenses.length > 0
                      ? therapist.licenses[0].title
                      : "Therapist"}
                    {" in "}
                    {therapist.clinic_city}, {therapist.clinic_province}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center h-8 overflow-hidden relative">
                  {therapist.areas_of_focus &&
                    therapist.areas_of_focus.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="inline-block bg-beige-extralight text-gray-700 px-2 py-1 text-xs rounded-full mr-1 whitespace-nowrap"
                      >
                        {area}
                      </span>
                    ))}
                  {therapist.areas_of_focus && therapist.areas_of_focus.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-white border-l border-gray-200 absolute right-0">
                      <span className="pl-1">+{therapist.areas_of_focus.length - 3} more</span>
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
