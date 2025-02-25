"use client";
import React from "react";
import { useTherapist } from "../contexts/TherapistContext";

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

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="sticky top-0 bg-white p-4 border-b z-10 flex justify-between items-center">
        <h2 className="text-xl font-medium">Matched Therapists</h2>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
          {therapists?.length || 0} found
        </span>
      </div>

      <div className="p-4">
        {showLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : showTherapists ? (
          <div className="space-y-6">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="border rounded-md p-4 hover:border-blue-500 transition-colors"
              >
                <div className="mb-3">
                  <h3 className="font-medium text-lg">
                    {therapist.first_name} {therapist.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {therapist.ai_summary || therapist.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                  {therapist.gender && (
                    <div>
                      <span className="font-medium">Gender:</span>{" "}
                      {therapist.gender}
                    </div>
                  )}
                  {therapist.ethnicity && (
                    <div>
                      <span className="font-medium">Ethnicity:</span>{" "}
                      {Array.isArray(therapist.ethnicity)
                        ? therapist.ethnicity[0]
                        : therapist.ethnicity}
                    </div>
                  )}
                  {therapist.faith && (
                    <div>
                      <span className="font-medium">Faith:</span>{" "}
                      {Array.isArray(therapist.faith)
                        ? therapist.faith[0]
                        : therapist.faith}
                    </div>
                  )}
                  {therapist.initial_price && (
                    <div>
                      <span className="font-medium">Initial Session:</span> $
                      {therapist.initial_price}
                    </div>
                  )}
                  {therapist.availability && (
                    <div>
                      <span className="font-medium">Availability:</span>{" "}
                      {therapist.availability === "both"
                        ? "both"
                        : therapist.availability === "in_person"
                        ? "in person"
                        : "online"}
                    </div>
                  )}
                </div>

                {/* Areas of focus */}
                {therapist.areas_of_focus &&
                  therapist.areas_of_focus.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-sm mb-1">
                        Areas of focus:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.areas_of_focus.map((area) => (
                          <span
                            key={area}
                            className="bg-gray-100 text-sm px-2 py-1 rounded-full"
                          >
                            {area.charAt(0).toUpperCase() + area.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <button className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                  Contact Therapist
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-16">
            <p className="text-lg font-medium">
              No therapists match your current criteria
            </p>
            <p className="text-sm mt-2">
              Try adjusting your filters or describe what you're looking for in
              the chat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
