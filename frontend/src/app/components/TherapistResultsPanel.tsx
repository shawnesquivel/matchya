"use client";
import React, { useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import CalendarIcon from "../../components/icons/CalendarIcon";
import GlobeIcon from "../../components/icons/GlobeIcon";
import Image from "next/image";
import Link from "next/link";

export default function TherapistResultsPanel() {
  const { therapists, isLoading, isSendingChat } = useTherapist();

  console.log(
    "[TherapistResultsPanel] Rendering with therapists:",
    therapists?.length || 0,
    "isLoading:",
    isLoading,
    "isSendingChat:",
    isSendingChat
  );

  // Show loading only when we're loading therapists, not when just sending chat
  const showLoading = isLoading && !isSendingChat;

  // Show therapists if we have them, even if chat is still sending
  const showTherapists = therapists?.length > 0;
  console.log(therapists);
  console.log(therapists[0]?.profile_img_url);

  // Add this useEffect for logging license data
  useEffect(() => {
    if (therapists.length > 0) {
      console.log("Therapist Results Panel - First therapist:", therapists[0]);
      console.log("License Data:", therapists[0].licenses);
      console.log("Verification Status:", therapists[0].is_verified);
    }
  }, [therapists]);

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="sticky top-0 p-4 z-10 flex justify-between items-center">
        <h2 className="text-lg font-medium text-mblack">Matched Therapists</h2>
        <span className="text-grey-medium px-2 py-1 text-sm">
          Showing {therapists?.length || 0} Therapists
        </span>
      </div>

      <div className="p-4">
        {showLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-medium"></div>
          </div>
        ) : showTherapists ? (
          <div className="space-y-6">
            {therapists.map((therapist) => (
              <Link
                key={therapist.id}
                href={`/therapists/${therapist.id}`}
                className="block bg-beige-extralight border border-grey-light rounded-xl p-6 hover:shadow-sm relative transition-all duration-200 hover:border-beige-dark hover:bg-beige-xxl"
              >
                <div className="flex items-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    {therapist.profile_img_url ? (
                      <Image
                        src={therapist.profile_img_url}
                        alt={`${therapist.first_name} ${therapist.last_name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-beige-dark flex items-center justify-center text-grey-medium">
                        {therapist.first_name?.[0]}
                        {therapist.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-2xl text-mblack">
                      {therapist.first_name} {therapist.last_name}
                    </h3>
                    <div className="flex items-center text-grey-medium mt-1">
                      <span className=" text-mblack text-xs">
                        {therapist.pronouns || "Pronouns Unavailable"}
                      </span>
                      <span className="mx-2 text-beige-dark text-xs">|</span>
                      <span className="text-mblack text-xs">
                        {therapist.clinic_city && therapist.clinic_province
                          ? `${therapist.clinic_city}, ${therapist.clinic_province}`
                          : "Location Unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {therapist.availability === "online" ||
                    therapist.availability === "both" ? (
                      therapist.clinic_profile_url ? (
                        <a
                          href={therapist.clinic_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                          title="Visit online clinic"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GlobeIcon className="text-m-black  w-4 h-4" />
                        </a>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center opacity-50 cursor-not-allowed z-10"
                          title="Online clinic profile not available w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GlobeIcon className="text-grey-medium w-4 h-4" />
                        </div>
                      )
                    ) : null}

                    {therapist.availability === "in_person" ||
                    therapist.availability === "both" ? (
                      therapist.clinic_booking_url ? (
                        <a
                          href={therapist.clinic_booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                          title="Book appointment"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarIcon className="text-m-black w-4 h-4" />
                        </a>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center opacity-50 cursor-not-allowed z-10"
                          title="Booking link not available"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CalendarIcon className="text-grey-medium w-4 h-4" />
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
                <p className="text-mblack text-base">
                  {therapist.ai_summary ||
                    therapist.bio ||
                    `Therapist based in ${
                      therapist.clinic_city || "various locations"
                    } working with ${
                      therapist.areas_of_focus?.length > 0
                        ? therapist.areas_of_focus.join(", ")
                        : "various mental health issues"
                    }.`}
                </p>

                {/* Areas of focus */}
                {/* {therapist.areas_of_focus && therapist.areas_of_focus.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {therapist.areas_of_focus.slice(0, 5).map((area) => (
                        <span
                          key={area}
                          className="bg-beige-light text-mblack px-3 py-1 rounded-full text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {area.charAt(0).toUpperCase() + area.slice(1).replace('_', ' ')}
                        </span>
                      ))}
                      {therapist.areas_of_focus.length > 5 && (
                        <span
                          className="bg-beige-light text-mblack px-3 py-1 rounded-full text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          +{therapist.areas_of_focus.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )} */}
                {/* 
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-green-medium text-white rounded-full hover:bg-green-dark transition-colors z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Contact therapist:', therapist.id);
                    }}
                  >
                    Contact
                  </button>
                </div> */}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-grey-medium py-16 bg-white rounded-xl border border-grey-light p-8">
            <p className="text-lg font-medium mb-2">
              No therapists match your current criteria
            </p>
            <p className="text-base">
              Try adjusting your filters or describe what you're looking for in
              the chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
