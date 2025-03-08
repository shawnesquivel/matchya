"use client";
import { TherapistProfile } from "../utils/supabaseHelpers";
import React from "react";

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
    variant === "modal"
      ? "border border-grey-dark rounded-lg p-8 flex flex-col gap-4"
      : "flex flex-col gap-5";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium mb-4 text-2xl";

  // Get individual and couple fees
  const getIndividualFees = () => {
    if (therapist.fees && therapist.fees.length > 0) {
      return therapist.fees.filter((fee) => fee.category?.toLowerCase() === "individual");
    }
    return [];
  };

  const getCoupleFees = () => {
    if (therapist.fees && therapist.fees.length > 0) {
      return therapist.fees.filter(
        (fee) =>
          fee.category?.toLowerCase() === "couples" || fee.category?.toLowerCase() === "couple"
      );
    }
    return [];
  };

  const individualFees = getIndividualFees();
  const coupleFees = getCoupleFees();

  // Fallback rates
  const hasIndividualRates =
    therapist.rates?.initial ||
    therapist.rates?.ongoing ||
    therapist.rates?.subsequent_60 ||
    therapist.rates?.subsequent_90;
  const hasCoupleRates = therapist.rates?.couples_initial || therapist.rates?.couples_subsequent;

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className={`${titleClasses} flex items-center gap-2`}>
          {variant === "modal" ? "Fees" : "Billing + Insurance"}
        </h2>
        {variant === "page" && therapist.booking_link && (
          <a
            href={therapist.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mblack underline text-base"
          >
            Full Pricing
          </a>
        )}
      </div>

      {/* Individual Counselling Section */}
      {(individualFees.length > 0 || hasIndividualRates) && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Individual Counselling</h3>
            <div className="flex flex-col gap-1">
              {/* Display detailed fees if available */}
              {individualFees.length > 0 ? (
                individualFees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-base">{fee.session_type}</span>
                      {fee.duration_minutes && (
                        <span className="text-grey-medium text-xs ml-1">
                          ({fee.duration_minutes} min)
                        </span>
                      )}
                    </div>
                    <span className="text-base">${fee.price}</span>
                  </div>
                ))
              ) : (
                // Fallback to rates
                <>
                  {therapist.rates?.initial && (
                    <div className="flex justify-between items-center">
                      <span className="text-base">Initial Visit</span>
                      <span className="text-2xl font-medium">${therapist.rates.initial}</span>
                    </div>
                  )}
                  {therapist.rates?.subsequent_60 ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-base">Subsequent Visit</span>
                        <span className="text-gray-500 ml-1">(60 min)</span>
                      </div>
                      <span className="text-base font-medium">
                        ${therapist.rates.subsequent_60}
                      </span>
                    </div>
                  ) : (
                    therapist.rates?.ongoing && (
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-base">Subsequent Visit</span>
                          <span className="text-gray-500 ml-1">(60 min)</span>
                        </div>
                        <span className="text-base font-medium">${therapist.rates.ongoing}</span>
                      </div>
                    )
                  )}
                  {therapist.rates?.subsequent_90 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-base">Subsequent Visit</span>
                        <span className="text-gray-500 ml-1">(90 min)</span>
                      </div>
                      <span className="text-base font-medium">
                        ${therapist.rates.subsequent_90}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Couple's Counselling Section */}
      {(coupleFees.length > 0 || hasCoupleRates) && (
        <div className="">
          <hr className="border-grey-light mt-1 mb-6" />
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Couple's Counselling</h3>
            <div className="flex flex-col gap-4">
              {/* Display detailed fees if available */}
              {coupleFees.length > 0 ? (
                coupleFees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-base">{fee.session_type}</span>
                      {fee.duration_minutes && (
                        <span className="text-grey-medium text-xs ml-1">
                          ({fee.duration_minutes} min)
                        </span>
                      )}
                    </div>
                    <span className="text-base">${fee.price}</span>
                  </div>
                ))
              ) : (
                // Fallback to rates
                <>
                  {therapist.rates?.couples_initial && (
                    <div className="flex justify-between items-center">
                      <span className="text-base">Initial Visit</span>
                      <span className="text-2xl font-medium">
                        ${therapist.rates.couples_initial}
                      </span>
                    </div>
                  )}
                  {therapist.rates?.couples_subsequent && (
                    <div className="flex justify-between items-center">
                      <span className="text-base">Subsequent Visit</span>
                      <span className="text-2xl font-medium">
                        ${therapist.rates.couples_subsequent}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Information (only on page view) */}
      {variant === "page" && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Insurance</h3>
          <p className="text-gray-700">
            Please contact the therapist directly to inquire about insurance coverage.
          </p>
        </div>
      )}
    </div>
  );
}
