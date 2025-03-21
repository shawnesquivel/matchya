"use client";
import React, { useEffect, useState } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import CalendarIcon from "../../components/icons/CalendarIcon";
import GlobeIcon from "../../components/icons/GlobeIcon";
import Image from "next/image";
import TherapistProfileModal from "./TherapistProfileModal";
import { mockTherapist } from "../utils/mockTherapistData";
import { trackModalOpen, trackOutboundLink } from "../utils/analytics";
import { ClientOnly } from "./ClientOnly";

// Add utility function to check image domains
const validateImageUrl = (url: string | null | undefined, therapistInfo: string): string => {
  if (!url) return "/assets/images/default-pp.png";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check for problem domains - specifically looking for underscores
    if (hostname.includes("_")) {
      console.warn(
        `[Image Domain Warning] Invalid hostname with underscore detected: "${hostname}" for therapist ${therapistInfo}`
      );
      return "/assets/images/default-pp.png";
    }

    return url;
  } catch (e) {
    console.error(
      `[Image URL Error] Invalid URL format: "${url}" for therapist ${therapistInfo}`,
      e
    );
    return "/assets/images/default-pp.png";
  }
};

interface TherapistResultsPanelProps {
  onResetLocation: () => void;
}

export default function TherapistResultsPanel({ onResetLocation }: TherapistResultsPanelProps) {
  const {
    therapists,
    isLoading,
    isSendingChat,
    filters,
    useMockData,
    toggleMockData,
    updateTherapists,
  } = useTherapist();
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

  // Handle opening the modal with a specific therapist
  const openTherapistModal = (therapistId: string) => {
    console.log("Opening modal for therapist:", therapistId);
    setSelectedTherapistId(therapistId);
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
      <div className="sm:flex hidden sticky top-0 sm:p-4 p-2 flex-col sm:flex-row sm:justify-between sm:items-center bg-white z-20 border-b border-grey-light">
        <div className="flex items-center gap-4">
          <h2 className="sm:block hidden text-lg font-medium text-mblack">Matched Therapists</h2>
        </div>

        <div className="flex items-center ml-auto">
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
            <ClientOnly>
              Showing {useMockData ? 1 : displayTherapists?.length || 0} Therapists
              {useMockData && " (Mock)"}
            </ClientOnly>
          </span>
        </div>
      </div>

      <div className="sm:p-4 p-2">
        {showLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-medium"></div>
          </div>
        ) : (
          <ClientOnly
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-gray-400">Loading therapists...</div>
              </div>
            }
          >
            {showTherapists ? (
              <>
                {/* First 3 therapists (full-width) */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-lg font-medium text-mblack sm:mb-4 mb-2">Top 3 Matches</h3>
                  {displayTherapists.slice(0, 3).map((therapist) => (
                    <div
                      key={therapist.id}
                      className="block bg-beige-extralight border border-grey-light rounded-xl md:p-6 p-4 hover:shadow-sm relative transition-all duration-200 hover:border-beige-dark hover:bg-beige-xxl cursor-pointer"
                      onClick={() => openTherapistModal(therapist.id)}
                    >
                      <div className="relative">
                        {/* Action buttons and chips - always positioned at top right */}
                        <div className="absolute top-0 right-0 flex items-center">
                          <div className="flex gap-2">
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
                            {therapist.clinic_booking_url && (
                              <a
                                href={therapist.clinic_booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                                title="Book appointment"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  trackOutboundLink(therapist.clinic_booking_url, {
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

                        {/* Main content layout - changes at small breakpoint */}
                        <div className="flex flex-col sm:flex-row items-start sm:pt-0 mb-4">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden sm:mx-0 mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                            {therapist.profile_img_url ? (
                              <Image
                                src={validateImageUrl(
                                  therapist.profile_img_url,
                                  `${therapist.first_name} ${therapist.last_name} (ID: ${therapist.id})`
                                )}
                                alt={`${therapist.first_name} ${therapist.last_name}`}
                                fill
                                className="object-cover"
                                onError={(e: any) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null; // Prevent infinite loop
                                  console.error(
                                    `Image load error for therapist "${therapist.first_name} ${therapist.last_name}" (ID: ${therapist.id})`,
                                    {
                                      url: therapist.profile_img_url,
                                      error: e.error || "Unknown error",
                                    }
                                  );
                                  target.src = "/assets/images/default-pp.png";
                                }}
                              />
                            ) : (
                              <Image
                                src="/assets/images/default-pp.png"
                                alt={`${therapist.first_name} ${therapist.last_name}`}
                                fill
                                className="object-cover"
                                priority
                              />
                            )}
                          </div>
                          <div className="my-auto text-left w-full sm:pl-0">
                            <div className="flex items-end gap-2">
                              <h3 className="font-new-spirit font-light text-2xl text-mblack">
                                {therapist.first_name} {therapist.last_name}
                              </h3>
                              <span className="text-grey-medium text-sm mb-0.5">
                                {therapist.pronouns || "Pronouns Unavailable"}
                              </span>
                            </div>
                            <div className="flex items-center text-mblack mt-1">
                              <span className="text-mblack text-xs">
                                {therapist.clinic_city && therapist.clinic_province
                                  ? `${therapist.clinic_city}, ${therapist.clinic_province}`
                                  : "Location Unavailable"}
                              </span>
                              <span className="mx-2 text-beige-dark text-xs">|</span>
                              <div className="flex gap-2">
                                {therapist.availability === "online" ||
                                therapist.availability === "both" ? (
                                  <div className="flex items-center gap-0.5">
                                    <div
                                      className="w-4 h-6 flex items-center justify-center"
                                      title="Online sessions available"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-m-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-xs text-m-black">Virtual</span>
                                  </div>
                                ) : null}
                                {therapist.availability === "in_person" ||
                                therapist.availability === "both" ? (
                                  <div className="flex items-center gap-0.5">
                                    <div
                                      className="w-4 h-6  flex items-center justify-center"
                                      title="In-person sessions available"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-green-dark"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 8h8M4 14h16"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-xs text-green-dark">In-person</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
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
                          className="block bg-beige-extralight border border-grey-light rounded-xl md:p-6 p-4 hover:shadow-sm relative transition-all duration-200 hover:border-beige-dark hover:bg-beige-xxl cursor-pointer"
                          onClick={() => openTherapistModal(therapist.id)}
                        >
                          {/* Top section with image and action buttons */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden sm:mx-0 mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                              {therapist.profile_img_url ? (
                                <Image
                                  src={validateImageUrl(
                                    therapist.profile_img_url,
                                    `${therapist.first_name} ${therapist.last_name} (ID: ${therapist.id})`
                                  )}
                                  alt={`${therapist.first_name} ${therapist.last_name}`}
                                  fill
                                  className="object-cover"
                                  onError={(e: any) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Prevent infinite loop
                                    console.error(
                                      `Image load error for therapist "${therapist.first_name} ${therapist.last_name}" (ID: ${therapist.id})`,
                                      {
                                        url: therapist.profile_img_url,
                                        error: e.error || "Unknown error",
                                      }
                                    );
                                    target.src = "/assets/images/default-pp.png";
                                  }}
                                />
                              ) : (
                                <Image
                                  src="/assets/images/default-pp.png"
                                  alt={`${therapist.first_name} ${therapist.last_name}`}
                                  fill
                                  className="object-cover"
                                  priority
                                />
                              )}
                            </div>
                            <div className="flex items-center">
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
                                    <GlobeIcon className="text-m-black w-4 h-4" />
                                  </a>
                                )}
                                {therapist.clinic_booking_url && (
                                  <a
                                    href={therapist.clinic_booking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-beige-dark flex items-center justify-center hover:bg-beige-dark transition-colors cursor-pointer z-10"
                                    title="Book appointment"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      trackOutboundLink(therapist.clinic_booking_url, {
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
                          </div>

                          {/* Name and location below the image */}
                          <div className="my-auto text-left w-full sm:pl-0">
                            <div className="flex items-end gap-2">
                              <h3 className="font-new-spirit font-light text-2xl text-mblack">
                                {therapist.first_name} {therapist.last_name}
                              </h3>
                              <span className="text-grey-medium text-sm mb-0.5">
                                {therapist.pronouns || "Pronouns Unavailable"}
                              </span>
                            </div>
                            <div className="flex items-center text-mblack mt-1">
                              <span className="text-mblack text-xs">
                                {therapist.clinic_city && therapist.clinic_province
                                  ? `${therapist.clinic_city}, ${therapist.clinic_province}`
                                  : "Location Unavailable"}
                              </span>
                              <span className="mx-2 text-beige-dark text-xs">|</span>
                              <div className="flex gap-2">
                                {therapist.availability === "online" ||
                                therapist.availability === "both" ? (
                                  <div className="flex items-center gap-0.5">
                                    <div
                                      className="w-4 h-6 flex items-center justify-center"
                                      title="Online sessions available"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-m-black"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-xs text-m-black">Virtual</span>
                                  </div>
                                ) : null}
                                {therapist.availability === "in_person" ||
                                therapist.availability === "both" ? (
                                  <div className="flex items-center gap-0.5">
                                    <div
                                      className="w-4 h-6  flex items-center justify-center"
                                      title="In-person sessions available"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-green-dark"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 8h8M4 14h16"
                                        />
                                      </svg>
                                    </div>
                                    <span className="text-xs text-green-dark">In-person</span>
                                  </div>
                                ) : null}
                              </div>
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
                <p className="text-lg font-medium mb-2">
                  No therapists match your current criteria
                </p>
                <p className="text-base">
                  Try adjusting your filters or describe what you're looking for in the chat.
                </p>
              </div>
            ) : (
              <div className="text-center text-grey-medium py-16 bg-white rounded-xl border border-grey-light p-8">
                <p className="text-lg font-medium mb-2">Ready to find your match?</p>
                <p className="text-base mb-4">
                  Describe what you're looking for in therapy or a therapist.
                </p>
              </div>
            )}
          </ClientOnly>
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
