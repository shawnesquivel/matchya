"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";
import React from "react";

interface TherapistQualificationsProps {
  therapist: TherapistProfile;
  variant: "modal" | "page";
  className?: string;
}

/**
 * Reusable component for displaying therapist qualifications and education
 */
export default function TherapistQualifications({
  therapist,
  variant = "page",
  className = "",
}: TherapistQualificationsProps) {
  const containerClasses =
    variant === "modal"
      ? "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-6"
      : "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-6";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium text-2xl";

  return (
    <div className={`${containerClasses} ${className}`}>
      <h2 className={titleClasses}>Qualifications</h2>

      <div className="flex flex-col gap-4">
        {/* Education */}
        {therapist.education && therapist.education.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Education</h3>
            <ul className="list-disc space-y-0.5 ml-4">
              {therapist.education.map((edu, index) => (
                <li key={index} className="">
                  {edu}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {therapist.certifications && therapist.certifications.length > 0 && (
          <div className="flex flex-col gap-2">
            <hr className="border-grey-light mt-2 mb-4" />
            <h3 className="text-xs font-medium">Certifications & Specialties</h3>
            <ul className="list-disc space-y-0.5 ml-4">
              {therapist.certifications.map((cert, index) => (
                <li key={index} className="">
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {therapist.languages && therapist.languages.length > 0 && (
          <div className="flex flex-col gap-2">
            <hr className="border-grey-light mt-2 mb-4" />
            <h3 className="text-xs font-medium">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.languages.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige"
                >
                  {getFlagIcon(language)} {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No qualifications case */}
        {(!therapist.education || therapist.education.length === 0) &&
          (!therapist.certifications || therapist.certifications.length === 0) && (
            <p className="text-sm text-grey-extraDark">Qualification information not available</p>
          )}
      </div>
    </div>
  );
}

// Function to get icon as emoji
function getFlagIcon(language: string): string {
  // Return emojis
  switch (language.toLowerCase()) {
    case "english":
      return "🇬🇧"; // UK
    case "spanish":
      return "🇪🇸"; // Spain
    case "french":
      return "🇫🇷"; // France
    case "german":
      return "🇩🇪"; // Germany
    case "chinese":
    case "mandarin":
    case "cantonese":
      return "🇨🇳"; // China
    case "japanese":
      return "🇯🇵"; // Japan
    case "russian":
      return "🇷🇺"; // Russia
    case "italian":
      return "🇮🇹"; // Italy
    case "portuguese":
      return "🇵🇹"; // Portugal
    case "arabic":
      return "🇸🇦"; // Saudi Arabia
    case "korean":
      return "🇰🇷"; // South Korea
    case "punjabi":
      return "🇮🇳"; // India
    case "thai":
      return "🇹🇭"; // Thailand
    case "dutch":
      return "🇳🇱"; // Netherlands
    case "swedish":
      return "🇸🇪"; // Sweden
    case "norwegian":
      return "🇳🇴"; // Norway
    case "danish":
      return "🇩🇰"; // Denmark
    case "finnish":
      return "🇫🇮"; // Finland
    case "turkish":
      return "🇹🇷"; // Turkey
    case "vietnamese":
      return "🇻🇳"; // Vietnam
    case "hebrew":
      return "🇮🇱"; // Israel
    default:
      return ""; // Default
  }
}
