"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";

interface TherapistLicensesProps {
  therapist: TherapistProfile;
  variant: "modal" | "page";
  className?: string;
}

/**
 * Reusable component for displaying therapist licenses
 */
export default function TherapistLicenses({
  therapist,
  variant = "page",
  className = "",
}: TherapistLicensesProps) {
  const containerClasses =
    variant === "modal" ? "border rounded-lg p-4" : "flex flex-col gap-3";

  const titleClasses =
    variant === "modal" ? "font-medium mb-2" : "font-medium mb-2 text-2xl";

  return (
    <div className={`${containerClasses} ${className}`}>
      <h2 className={titleClasses}>License</h2>

      {therapist.licenses && therapist.licenses.length > 0 ? (
        <div className="space-y-4">
          {therapist.licenses.map((license, index) => (
            <div key={index} className="space-y-1">
              <h3 className="font-medium">{license.title}</h3>
              <p className="text-gray-600">
                License Number: {license.license_number}
              </p>
              <p className="text-gray-600">State/Province: {license.state}</p>
              {license.issuing_body && (
                <p className="text-gray-600">
                  Issuing Body: {license.issuing_body}
                </p>
              )}
              {license.is_verified && (
                <p className="text-green-600 text-sm">✓ Verified</p>
              )}
            </div>
          ))}
        </div>
      ) : therapist.experience.some(
          (exp) =>
            exp.position.toLowerCase().includes("license") ||
            exp.organization.toLowerCase().includes("license")
        ) ? (
        <div className="space-y-4">
          {therapist.experience
            .filter(
              (exp) =>
                exp.position.toLowerCase().includes("license") ||
                exp.organization.toLowerCase().includes("license")
            )
            .map((license, index) => (
              <div key={index} className="space-y-1">
                <h3 className="font-medium">{license.position}</h3>
                <p className="text-gray-600">{license.organization}</p>
                <p className="text-gray-500 text-sm">
                  {license.startYear}
                  {license.endYear ? ` - ${license.endYear}` : " - Present"}
                </p>
              </div>
            ))}
        </div>
      ) : therapist.qualifications && therapist.qualifications.length > 0 ? (
        <div className="space-y-1">
          <ul className="list-disc list-inside">
            {therapist.qualifications.map((qual, index) => (
              <li key={index} className="text-gray-700 mb-1">
                {qual}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-1">
          <span className="text-sm text-grey-extraDark">
            License information not available
          </span>
        </div>
      )}
    </div>
  );
}
