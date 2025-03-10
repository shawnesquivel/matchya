"use client";
import React, { useEffect, useState } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import CalendarIcon from "../../components/icons/CalendarIcon";
import GlobeIcon from "../../components/icons/GlobeIcon";
import Image from "next/image";
import TherapistProfileModal from "./TherapistProfileModal";
import { mockTherapist } from "../utils/mockTherapistData";
import { trackModalOpen, trackOutboundLink } from "../utils/analytics";

export default function TherapistResultsPanel() {
  const { therapists, isLoading, isSendingChat, filters, useMockData, toggleMockData } =
    useTherapist();
  // Add state for the modal - initialize with specific therapist ID
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);

  // Handle opening the mock modal when in mock mode
  useEffect(() => {
    if (useMockData && !selectedTherapistId) {
      // Set the mock therapist ID
      setSelectedTherapistId(`${mockTherapist.first_name} ${mockTherapist.last_name}`);
    }
  }, [useMockData, selectedTherapistId]);

  // Show loading only when we're loading therapists, not when just sending chat
  const showLoading = isLoading && !isSendingChat && !useMockData;

  // Show therapists if we have them, even if chat is still sending
  // If in mock mode, always show the therapist
  const showTherapists = useMockData || therapists?.length > 0;

  // Helper function to deduplicate therapists by ID
  const deduplicateTherapists = (therapists: any[]): any[] => {
    if (!therapists || !therapists.length) return [];
    return Array.from(new Map(therapists.map((therapist) => [therapist.id, therapist])).values());
  };

  // Get therapists to display - either mock data or real data (with deduplication)
  const displayTherapists = useMockData ? [mockTherapist] : deduplicateTherapists(therapists);

  // Add this useEffect for logging license data
  useEffect(() => {
    if (therapists.length > 0) {
      console.log("Therapist Results Panel - First therapist:", therapists[0]);
      console.log("License Data:", therapists[0].licenses);
      console.log("Verification Status:", therapists[0].is_verified);
    }
  }, [therapists]);

  // Helper to format active filters for display
  const getActiveFiltersText = () => {
    const activeFilters = [];

    if (filters.gender) activeFilters.push(`Gender: ${filters.gender}`);
    if (filters.ethnicity?.length) activeFilters.push(`Ethnicity: ${filters.ethnicity.join(", ")}`);
    if (filters.sexuality?.length) activeFilters.push(`Sexuality: ${filters.sexuality.join(", ")}`);
    if (filters.faith?.length) activeFilters.push(`Faith: ${filters.faith.join(", ")}`);
    if (filters.max_price_initial) activeFilters.push(`Max price: $${filters.max_price_initial}`);
    if (filters.availability) activeFilters.push(`Availability: ${filters.availability}`);

    return activeFilters.length > 0
      ? `Current filters: ${activeFilters.join(" • ")}`
      : "No filters are currently active.";
  };

  // Handle opening the modal with a specific therapist
  const openTherapistModal = (therapistId: string) => {
    console.log("Opening modal for therapist:", therapistId);

    // Format name in a way that the API can find it
    const formattedName = therapistId.trim();
    console.log("Formatted name for search:", formattedName);

    // Track modal open event
    trackModalOpen({
      id: formattedName,
      name: formattedName,
    });

    setSelectedTherapistId(formattedName);
    setIsModalOpen(true);
  };

  // Helper to check if any filters are active or if chat has been used
  const hasUserTakenAction = () => {
    // Check if any filters have been set
    const hasActiveFilters = !!(
      filters.gender ||
      filters.ethnicity?.length ||
      filters.sexuality?.length ||
      filters.faith?.length ||
      filters.max_price_initial ||
      filters.availability
    );

    // Return true if either filters are active or chat has messages
    return hasActiveFilters;
  };

  // Helper function to truncate bio to first 2 sentences without "Read more" link
  const truncateBioToTwoSentencesNoReadMore = (text: string | null | undefined): string => {
    if (!text) return "";

    // Match sentences ending with period, exclamation point, or question mark
    // followed by a space or end of string
    const sentenceRegex = /[^.!?]*[.!?](\s|$)/g;
    const sentences = text.match(sentenceRegex);

    if (!sentences || sentences.length === 0) {
      // If no sentences detected, return first 100 characters
      return text.length > 100 ? `${text.substring(0, 100)}...` : text;
    }

    // Get first two sentences or fewer if not enough
    const firstTwoSentences = sentences.slice(0, 2).join("");

    // If there are more than 2 sentences, add ellipsis
    if (sentences.length > 2) {
      return `${firstTwoSentences.trim()}...`;
    }

    // If only 1-2 sentences, just return them
    return firstTwoSentences;
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <div className="sticky top-0 p-4 flex justify-between items-center bg-white z-20">
        <h2 className="text-lg font-medium text-mblack">Matched Therapists</h2>
        <div className="flex items-center">
          {/* Mock data toggle button (only in development) */}
          {process.env.NODE_ENV !== "production" && (
            <button
              onClick={() => toggleMockData()}
              className={`mr-4 px-3 py-1 text-xs rounded-md ${
                useMockData ? "bg-green-medium text-white" : "bg-gray-200 text-gray-800"
              }`}
              title={useMockData ? "Using mock data" : "Using real data"}
            >
              {useMockData ? "Mock: ON" : "Mock: OFF"}
            </button>
          )}
          <span className="text-grey-medium px-2 py-1 text-sm">
            Showing {useMockData ? 1 : displayTherapists?.length || 0} Therapists
            {useMockData && " (Mock)"}
          </span>
        </div>
      </div>

      <div className="p-4">
        {showLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-medium"></div>
          </div>
        ) : showTherapists ? (
          <>
            {/* First 3 therapists (full-width) */}
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-medium text-mblack mb-4">Top 3 Matches</h3>
              {displayTherapists.slice(0, 3).map((therapist) => (
                <div
                  key={therapist.id}
                  className="block bg-beige-extralight border border-grey-light rounded-xl p-6 hover:shadow-sm relative transition-all duration-200 hover:border-beige-dark hover:bg-beige-xxl cursor-pointer"
                  onClick={() =>
                    openTherapistModal(`${therapist.first_name} ${therapist.last_name}`)
                  }
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
                        <span className="text-mblack text-xs">
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
                    <div className="ml-auto flex gap-2 mb-auto">
                      {therapist.clinic_profile_url && (
                        <a
                          href={therapist.clinic_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                          title="Visit website"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackOutboundLink(therapist.clinic_profile_url, {
                              id: therapist.id,
                              name: `${therapist.first_name} ${therapist.last_name}`,
                              linkType: "website",
                              source: "results_panel",
                            });
                          }}
                        >
                          <GlobeIcon className="text-m-black w-4 h-4" />
                        </a>
                      )}
                      {therapist.booking_link && (
                        <a
                          href={therapist.booking_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                          title="Book appointment"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackOutboundLink(therapist.booking_link, {
                              id: therapist.id,
                              name: `${therapist.first_name} ${therapist.last_name}`,
                              linkType: "booking",
                              source: "results_panel",
                            });
                          }}
                        >
                          <CalendarIcon className="text-m-black w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-mblack text-base mb-4">
                    {truncateBioToTwoSentencesNoReadMore(
                      therapist.ai_summary ||
                        therapist.bio ||
                        `Therapist based in ${
                          therapist.clinic_city || "various locations"
                        } working with ${
                          therapist.areas_of_focus?.length > 0
                            ? therapist.areas_of_focus.join(", ")
                            : "various mental health issues"
                        }.`
                    )}
                  </p>

                  {/* Areas of focus tags - up to 6 for top therapists */}
                  {therapist.areas_of_focus && therapist.areas_of_focus.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {therapist.areas_of_focus.slice(0, 6).map((area) => (
                        <span
                          key={area}
                          className="bg-beige-dark text-mblack px-3 py-1 rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))}
                      {therapist.areas_of_focus.length > 6 && (
                        <span className="text-gray-500 text-xs flex items-center">
                          +{therapist.areas_of_focus.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Remaining therapists (two-column grid) */}
            {displayTherapists.length > 3 && (
              <div>
                <h3 className="text-lg font-medium text-mblack mb-4">
                  You may also like these therapists
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayTherapists.slice(3).map((therapist) => (
                    <div
                      key={therapist.id}
                      className="block bg-beige-extralight border border-grey-light rounded-xl p-6 hover:shadow-sm relative transition-all duration-200 hover:border-beige-dark hover:bg-beige-xxl cursor-pointer"
                      onClick={() =>
                        openTherapistModal(`${therapist.first_name} ${therapist.last_name}`)
                      }
                    >
                      {/* Top section with image and action buttons */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
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
                        <div className="flex gap-2">
                          {therapist.clinic_profile_url && (
                            <a
                              href={therapist.clinic_profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                              title="Visit website"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackOutboundLink(therapist.clinic_profile_url, {
                                  id: therapist.id,
                                  name: `${therapist.first_name} ${therapist.last_name}`,
                                  linkType: "website",
                                  source: "results_panel",
                                });
                              }}
                            >
                              <GlobeIcon className="text-m-black w-3 h-3" />
                            </a>
                          )}
                          {therapist.booking_link && (
                            <a
                              href={therapist.booking_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                              title="Book appointment"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackOutboundLink(therapist.booking_link, {
                                  id: therapist.id,
                                  name: `${therapist.first_name} ${therapist.last_name}`,
                                  linkType: "booking",
                                  source: "results_panel",
                                });
                              }}
                            >
                              <CalendarIcon className="text-m-black w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Name and location below the image */}
                      <div className="mb-2 flex flex-col gap-1">
                        <h3 className="font-medium text-xl text-mblack">
                          {therapist.first_name} {therapist.last_name}
                        </h3>
                        <div className="flex items-center text-grey-medium mt-1">
                          <span className="text-mblack text-xs">
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

                      {/* Bio text */}
                      <p className="text-mblack text-sm line-clamp-2 mb-3">
                        {truncateBioToTwoSentencesNoReadMore(
                          therapist.ai_summary ||
                            therapist.bio ||
                            `Therapist working with ${
                              therapist.areas_of_focus?.length > 0
                                ? therapist.areas_of_focus.join(", ")
                                : "various mental health issues"
                            }.`
                        )}
                      </p>

                      {/* Areas of focus tags (limit to 3 for the grid view) */}
                      {therapist.areas_of_focus && therapist.areas_of_focus.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {therapist.areas_of_focus.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="bg-beige-dark text-mblack px-2 py-0.5 rounded-full text-xs"
                            >
                              {area}
                            </span>
                          ))}
                          {therapist.areas_of_focus.length > 3 && (
                            <span className="text-gray-500 text-xs flex items-center">
                              +{therapist.areas_of_focus.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : hasUserTakenAction() ? (
          <div className="text-center text-grey-medium py-16 bg-white rounded-xl border border-grey-light p-8">
            <p className="text-lg font-medium mb-2">No therapists match your current criteria</p>
            <p className="text-base">
              Try adjusting your filters or describe what you're looking for in the chat.
            </p>
          </div>
        ) : (
          <div className="text-center text-grey-medium py-16 bg-white rounded-xl border border-grey-light p-8">
            <p className="text-lg font-medium mb-2">Ready to find your match?</p>
            <p className="text-base mb-4">
              Use the filters on the left to refine your search, or simply describe what you're
              looking for in the chat.
            </p>
          </div>
        )}
      </div>

      {/* Therapist Profile Modal */}
      <TherapistProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        therapistId={selectedTherapistId}
      />
    </div>
  );
}
