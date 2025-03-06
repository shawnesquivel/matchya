"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";

interface TherapistFeesProps {
  therapist: TherapistProfile;
  variant: "modal" | "page";
  className?: string;
}

/**
 * Reusable component for displaying therapist fees
 */
export default function TherapistFees({
  therapist,
  variant = "page",
  className = "",
}: TherapistFeesProps) {
  // Container styling based on variant
  const containerClasses =
    variant === "modal" ? "border rounded-lg p-4 mb-6" : "flex flex-col gap-3";

  const titleClasses =
    variant === "modal" ? "font-medium mb-2" : "font-medium mb-2 text-2xl";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={titleClasses}>
          {variant === "modal" ? "Fees" : "Billing & Insurance"}
        </h2>
        {therapist.booking_link && variant === "page" && (
          <a
            href={therapist.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-matchya-green underline text-sm"
          >
            Full Pricing
          </a>
        )}
      </div>

      <div className="">
        {/* Individual Counselling */}
        <div className="mb-8">
          <h3 className="text-lg mb-4">For Individual Counselling</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Initial Visit</span>
              {therapist.rates?.initial && therapist.rates.initial > 0 ? (
                <span className="text-xl">${therapist.rates.initial}</span>
              ) : (
                <span className="text-sm text-grey-extraDark">
                  Info not available
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span>Subsequent Visit </span>
                <span className="text-gray-500">(60 min)</span>
              </div>
              {therapist.rates?.subsequent_60 &&
              therapist.rates.subsequent_60 > 0 ? (
                <span className="text-xl">
                  ${therapist.rates.subsequent_60}
                </span>
              ) : (
                <span className="text-sm text-grey-extraDark">
                  Info not available
                </span>
              )}
            </div>
            {variant === "page" && (
              <div className="flex justify-between items-center">
                <div>
                  <span>Subsequent Visit </span>
                  <span className="text-gray-500">(90 min)</span>
                </div>
                {therapist.rates?.subsequent_90 &&
                therapist.rates.subsequent_90 > 0 ? (
                  <span className="text-xl">
                    ${therapist.rates.subsequent_90}
                  </span>
                ) : (
                  <span className="text-sm text-grey-extraDark">
                    Info not available
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Show Couple's Counselling in page view */}
        {variant === "page" && (
          <>
            {/* Couple's Counselling */}
            <div className="mb-8">
              <h3 className="text-lg mb-4">For Couple's Counselling</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Initial Visit</span>
                  {therapist.rates?.couples_initial &&
                  therapist.rates.couples_initial > 0 ? (
                    <span className="text-xl">
                      ${therapist.rates.couples_initial}
                    </span>
                  ) : (
                    <span className="text-sm text-grey-extraDark">
                      Info not available
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span>Subsequent Visit</span>
                  {therapist.rates?.couples_subsequent &&
                  therapist.rates.couples_subsequent > 0 ? (
                    <span className="text-xl">
                      ${therapist.rates.couples_subsequent}
                    </span>
                  ) : (
                    <span className="text-sm text-grey-extraDark">
                      Info not available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sliding Scale and Billing */}
            <div className="mb-8">
              <h3 className="text-lg mb-2">Sliding Scale</h3>
              <div className="flex items-center">
                <span className="text-sm text-grey-extraDark">
                  Info Not Available
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg mb-2">Billing</h3>
              <div className="flex items-center">
                <span className="text-sm text-grey-extraDark">
                  Info Not Available
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
