"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";
import { Checkmark, Warning } from "../../components/Icons";
import React from "react";

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
    variant === "modal"
      ? "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-6"
      : "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-6";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium mb-2 text-2xl";

  // Component to render verification status with icons
  const VerificationStatus = ({ isVerified }: { isVerified?: boolean }) => {
    return (
      <div className="flex items-center gap-2 mt-1">
        {isVerified ? (
          <>
            <Checkmark className="text-[#466421]" />
            <span className="text-sm text-[#466421] font-medium">License Verified</span>
          </>
        ) : (
          <>
            <Warning className="text-[#878787]" />
            <span className="text-sm text-[#878787] font-medium">Verification Pending</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col gap-4 text-mblack">
        <h2 className={`${titleClasses} flex items-center gap-2`}>
          License{" "}
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg> */}
        </h2>

        {therapist.licenses && therapist.licenses.length > 0 ? (
          <div className="space-y-4">
            {therapist.licenses.map((license, index) => (
              <div key={index} className="flex flex-col gap-1 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs">License Title</h3>
                    <p className="text-sm">{license.title}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs">License Number</h3>
                    <p className="text-sm">{license.license_number}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs">Jurisdiction</h3>
                    <p className="text-sm">{license.state}</p>
                  </div>

                  {license.issuing_body && (
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs">Issuing Body</h3>
                      <p className="text-sm">{license.issuing_body}</p>
                    </div>
                  )}

                  {license.expiry_date && (
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs">Expires</h3>
                      <p className="text-sm">{license.expiry_date}</p>
                    </div>
                  )}

                  <div className="mt-1">
                    <VerificationStatus isVerified={license.is_verified} />
                  </div>
                </div>
                {index < therapist.licenses.length - 1 && (
                  <hr className="border-grey-light mt-5 mb-1" />
                )}
              </div>
            ))}
          </div>
        ) : therapist?.certifications && therapist?.certifications?.length > 0 ? (
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1 pb-2">
              <h3 className="text-xs font-medium">Professional Qualifications</h3>
              <ul className="list-disc list-inside pl-2">
                {therapist?.certifications?.map((qual, index) => (
                  <li key={index} className="text-sm text-gray-700 mb-1">
                    {qual}
                  </li>
                ))}
              </ul>
              <VerificationStatus isVerified={false} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-2">
            <span className="text-sm text-grey-extraDark">License information not available</span>
          </div>
        )}
      </div>
    </div>
  );
}
