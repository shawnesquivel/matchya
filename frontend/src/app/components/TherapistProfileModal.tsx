"use client";
import React, { useEffect, useState } from "react";
import {
  TherapistProfile,
  getTherapistProfile,
} from "../utils/supabaseHelpers";
import CollapsibleSpecialties from "@/app/components/CollapsibleSpecialties";
import CollapsibleApproaches from "@/app/components/CollapsibleApproaches";
import TelehealthStatus from "@/components/TelehealthStatus";
import TherapistHeader from "./TherapistHeader";
import TherapistFees from "./TherapistFees";
import TherapistLicenses from "./TherapistLicenses";

interface TherapistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string | null;
}

export default function TherapistProfileModal({
  isOpen,
  onClose,
  therapistId,
}: TherapistProfileModalProps) {
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch therapist data when the modal opens and therapistId changes
  useEffect(() => {
    async function fetchTherapist() {
      if (!isOpen || !therapistId) return;

      setLoading(true);
      setError(null);

      console.log(
        "TherapistProfileModal: Fetching therapist with ID/name:",
        therapistId
      );

      try {
        const profile = await getTherapistProfile(therapistId);
        console.log("TherapistProfileModal: Fetch result:", profile);
        setTherapist(profile);

        if (!profile) {
          console.error(
            "TherapistProfileModal: No profile found for:",
            therapistId
          );
          setError(`No profile found for "${therapistId}"`);
        }
      } catch (err) {
        console.error("TherapistProfileModal: Error fetching therapist:", err);
        setError(`Failed to load therapist profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTherapist();
  }, [isOpen, therapistId]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    // Add event listener when the modal is open
    if (isOpen) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    // Clean up the event listener when component unmounts or modal closes
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Handle clicking outside the modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if the click is directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto p-4 animate-fadeIn"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="therapist-profile-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-slideIn"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
              aria-hidden="true"
            ></div>
            <span className="sr-only">Loading therapist profile...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        ) : therapist ? (
          <div className="p-6">
            <TherapistHeader
              therapist={therapist}
              variant="modal"
              showBookingButton={false}
            />

            <TherapistLicenses
              therapist={therapist}
              variant="modal"
              className="border-t pt-4 mt-4 mb-6"
            />

            {/* Quick info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h2 className="font-medium mb-2">About</h2>
                <p className="text-gray-700">
                  {therapist.bio || "No bio available"}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="font-medium mb-2">Contact & Availability</h2>
                <div className="mb-2">
                  <h3 className="text-sm font-medium">Telehealth</h3>
                  <TelehealthStatus isAvailable={therapist.available_online} />
                </div>

                {therapist.booking_link && (
                  <a
                    href={therapist.booking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Book an Appointment
                  </a>
                )}
              </div>
            </div>

            {/* Specialties & Approaches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h2 className="font-medium mb-2">Areas of Practice</h2>
                <CollapsibleSpecialties
                  specialties={therapist.specialties || []}
                />
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="font-medium mb-2">Therapeutic Approaches</h2>
                <CollapsibleApproaches
                  approaches={therapist.approaches || []}
                />
              </div>
            </div>

            <TherapistFees therapist={therapist} variant="modal" />

            <div className="border rounded-lg p-4">
              <h2 className="font-medium mb-2">Qualifications</h2>
              <div className="mb-4">
                {therapist.education.map((edu, index) => (
                  <div key={index} className="mb-2">
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-gray-600">
                      {edu.institution}, {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p>No therapist data found</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
