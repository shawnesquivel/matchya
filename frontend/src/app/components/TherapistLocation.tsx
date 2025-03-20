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
      ? "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-6"
      : "border border-grey-dark rounded-lg sm:p-8 p-4  flex flex-col gap-6";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium text-3xl";

  const formattedAddress = [
    therapist.clinic_street,
    therapist.clinic_city,
    therapist.clinic_province,
    therapist.clinic_postal_code,
    therapist.clinic_country,
  ]
    .filter(Boolean)
    .join(", ");

  // Check if therapist supports online sessions based on availability field
  const supportsOnline = therapist.availability === "online" || therapist.availability === "both";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col gap-3 text-mblack">
        <h2 className={titleClasses}>Location</h2>

        {/* Only show In-Person section if clinic or location data exists */}
        {(therapist.clinic_name || formattedAddress) && (
          <div className="flex flex-col gap-1">
            <h3 className="text-xs">In-Person Appointments</h3>
            <div className="flex flex-col gap-0">
              {therapist.clinic_name && <p className="font-sm">{therapist.clinic_name}</p>}
              {formattedAddress && <p className="font-sm">{formattedAddress}</p>}
            </div>
          </div>
        )}

        {/* Only show Availability section if availability data exists */}
        {therapist.availability && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {supportsOnline && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige">
                  Online Sessions
                </span>
              )}
              {(therapist.availability === "in_person" || therapist.availability === "both") && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige">
                  In-Person
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Only show Contact section if any contact info exists */}
      {(therapist.therapist_phone || therapist.clinic_phone || therapist.therapist_email) && (
        <div className="flex flex-col gap-3 text-mblack">
          <hr className="border-grey-light" />
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
