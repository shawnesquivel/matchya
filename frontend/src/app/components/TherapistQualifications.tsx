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
      ? "border border-grey-dark rounded-lg p-8 flex flex-col gap-6"
      : "flex flex-col gap-3";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium text-2xl";

  return (
    <div className={`${containerClasses} ${className}`}>
      <h2 className={titleClasses}>Qualifications</h2>

      <div className="flex flex-col gap-4">
        {/* Education */}
        {therapist.education && therapist.education.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Education</h3>
            <div className="flex flex-col gap-0.5">
              {therapist.education.map((edu, index) => (
                <div key={index} className="">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-grey-medium text-xs">
                    {edu.institution}, {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <hr className="border-grey-light mt-2 mb-2" /> {/* Professional Experience */}
        {therapist.experience && therapist.experience.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Professional Experience</h3>
            <div className="space-y-2">
              {therapist.experience.map((exp, index) => (
                <div key={index} className="flex flex-col gap-0.5">
                  <p className="font-medium">{exp.position}</p>
                  <p className="text-grey-medium text-xs">
                    {exp.organization}
                    <br></br> {exp.startYear}
                    {exp.endYear ? ` - ${exp.endYear}` : " - Present"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <hr className="border-grey-light mt-2 mb-2" /> {/* Certifications */}
        {therapist.qualifications && therapist.qualifications.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Certifications & Specialties</h3>
            <ul className="list-disc space-y-0.5 ml-4">
              {therapist.qualifications.map((qual, index) => (
                <li key={index} className="">
                  {qual}
                </li>
              ))}
            </ul>
          </div>
        )}
        <hr className="border-grey-light mt-2 mb-2" /> {/* Languages */}
        {therapist.languages && therapist.languages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.languages.map((language, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige"
                >
                  {/* Assuming a function getFlagIcon(language) that returns the appropriate flag icon */}
                  {getFlagIcon(language)} {language}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* No qualifications case */}
        {(!therapist.education || therapist.education.length === 0) &&
          (!therapist.experience || therapist.experience.length === 0) &&
          (!therapist.qualifications || therapist.qualifications.length === 0) && (
            <p className="text-sm text-grey-extraDark">Qualification information not available</p>
          )}
      </div>
    </div>
  );
}

// Function to get flag icon as emoji based on language
function getFlagIcon(language: string): string {
  // Return flag emojis based on language
  switch (language.toLowerCase()) {
    case "english":
      return "🇬🇧"; // UK flag for English
    case "spanish":
      return "🇪🇸"; // Spain flag for Spanish
    case "french":
      return "🇫🇷"; // France flag for French
    case "german":
      return "🇩🇪"; // Germany flag for German
    case "chinese":
    case "mandarin":
    case "cantonese":
      return "🇨🇳"; // China flag for Chinese
    case "japanese":
      return "🇯🇵"; // Japan flag for Japanese
    case "russian":
      return "🇷🇺"; // Russia flag for Russian
    case "italian":
      return "🇮🇹"; // Italy flag for Italian
    case "portuguese":
      return "🇵🇹"; // Portugal flag for Portuguese
    case "arabic":
      return "🇸🇦"; // Saudi Arabia flag for Arabic
    case "korean":
      return "🇰🇷"; // South Korea flag for Korean
    // Add more cases for other languages as needed
    default:
      return ""; // Default flag
  }
}
