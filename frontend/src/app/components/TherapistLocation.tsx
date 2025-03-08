"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";
import React from "react";

interface TherapistLocationProps {
  therapist: TherapistProfile;
  variant: "modal" | "page";
  className?: string;
}

/**
 * Reusable component for displaying therapist location information
 */
export default function TherapistLocation({
  therapist,
  variant = "modal",
  className = "",
}: TherapistLocationProps) {
  const containerClasses =
    variant === "modal"
      ? "border border-grey-dark rounded-lg p-8 flex flex-col gap-6"
      : "flex flex-col gap-8";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium text-3xl";

  // Format address if location exists
  const formattedAddress = therapist.location
    ? [
        therapist.clinic_street,
        therapist.location.city,
        therapist.location.province,
        therapist.clinic_postal_code,
        therapist.location.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col gap-3 text-mblack">
        <h2 className={titleClasses}>Location</h2>

        {/* Only show In-Person section if clinic or location data exists */}
        {(therapist.clinic || formattedAddress) && (
          <div className="flex flex-col gap-1">
            <h3 className="text-xs">In-Person Appointments</h3>
            <div className="flex flex-col gap-0">
              {therapist.clinic && <p className="font-sm">{therapist.clinic}</p>}
              {formattedAddress && <p className="font-sm">{formattedAddress}</p>}
            </div>
          </div>
        )}

        {/* Only show Availability section if availability data exists */}
        {(therapist.available_online || true) && ( // Assuming in-person is always available based on original code
          <div className="flex flex-col gap-2">
            <h3 className="text-xs">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.available_online && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige">
                  Online Sessions
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige">
                In-Person
              </span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-grey-light" />

      {/* Only show Contact section if any contact info exists */}
      {(therapist.therapist_phone || therapist.clinic_phone || therapist.therapist_email) && (
        <div className="flex flex-col gap-3 text-mblack">
          <h2 className={titleClasses}>Contact</h2>
          <div className="flex flex-col gap-2">
            {therapist.therapist_phone && (
              <div className="flex flex-col gap-1">
                <h3 className="text-xs">Phone</h3>
                <p className="text-sm">{therapist.therapist_phone}</p>
              </div>
            )}
            {therapist.clinic_phone && therapist.therapist_phone !== therapist.clinic_phone && (
              <div className="flex flex-col gap-1">
                <h3 className="text-xs">Clinic Phone</h3>
                <p className="text-sm">{therapist.clinic_phone}</p>
              </div>
            )}
            {therapist.therapist_email && (
              <div className="flex flex-col gap-1">
                <h3 className="text-xs">Email</h3>
                <p className="text-sm">{therapist.therapist_email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
