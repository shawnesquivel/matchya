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
      ? "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-4"
      : "border border-grey-dark rounded-lg sm:p-8 p-4 flex flex-col gap-4";

  const titleClasses = variant === "modal" ? "font-medium text-xl" : "font-medium mb-4 text-2xl";

  // Get fees by session type
  const getFeesBySessionType = (sessionType: string) => {
    if (therapist.fees && therapist.fees.length > 0) {
      return therapist.fees.filter(
        (fee) => fee.session_type?.toLowerCase() === sessionType.toLowerCase()
      );
    }
    return [];
  };

  const individualFees = getFeesBySessionType("individual");
  const coupleFees = getFeesBySessionType("couples") || getFeesBySessionType("couple");
  const familyFees = getFeesBySessionType("family");
  const groupFees = getFeesBySessionType("group");

  // Group fees by delivery method if applicable
  const getDeliveryMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case "in_person":
        return "In-Person";
      case "virtual":
        return "Online";
      case "hybrid":
        return "Hybrid";
      default:
        return method;
    }
  };

  // Format display name for session category
  const formatSessionCategory = (category: string) => {
    switch (category?.toLowerCase()) {
      case "initial":
        return "Initial Visit";
      case "subsequent":
        return "Subsequent Visit";
      case "consultation":
        return "Consultation";
      default:
        return category;
    }
  };

  // Format currency if available
  const formatPrice = (price: number, currency?: string) => {
    if (!currency || currency === "USD" || currency === "CAD") {
      return `$${price}`;
    }
    return `${price} ${currency}`;
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex md:justify-between md:items-center items-start md:flex-row flex-col">
        <h2 className={`${titleClasses} flex items-center gap-2`}>
          {variant === "modal" ? "Fees" : "Fees"}
        </h2>
        {variant === "page" && therapist.booking_link && (
          <a
            href={therapist.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mblack text-sm relative group"
          >
            <span className="relative inline-block">
              View Full Pricing
              <span className="absolute left-0 bottom-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full"></span>
            </span>
          </a>
        )}
      </div>

      {/* Individual Counselling Section */}
      {individualFees.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Individual Counselling</h3>
            <div className="flex flex-col gap-1">
              {individualFees.map((fee, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-base">
                        {formatSessionCategory(fee.session_category)}
                      </span>
                    </div>
                    <div className="flex text-xs text-grey-medium">
                      {fee.duration_minutes && (
                        <span className="mr-2">{fee.duration_minutes} min</span>
                      )}
                      {fee.delivery_method && (
                        <span>{getDeliveryMethodLabel(fee.delivery_method)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-base">{formatPrice(fee.price, fee.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Couple's Counselling Section */}
      {coupleFees.length > 0 && (
        <div className="">
          <hr className="border-grey-light mt-1 mb-6" />
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Couple's Counselling</h3>
            <div className="flex flex-col gap-1">
              {coupleFees.map((fee, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-base">
                        {formatSessionCategory(fee.session_category)}
                      </span>
                    </div>
                    <div className="flex text-xs text-grey-medium">
                      {fee.duration_minutes && (
                        <span className="mr-2">{fee.duration_minutes} min</span>
                      )}
                      {fee.delivery_method && (
                        <span>{getDeliveryMethodLabel(fee.delivery_method)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-base">{formatPrice(fee.price, fee.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Family Counselling Section - New */}
      {familyFees.length > 0 && (
        <div className="">
          <hr className="border-grey-light mt-1 mb-6" />
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Family Counselling</h3>
            <div className="flex flex-col gap-1">
              {familyFees.map((fee, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-base">
                        {formatSessionCategory(fee.session_category)}
                      </span>
                    </div>
                    <div className="flex text-xs text-grey-medium">
                      {fee.duration_minutes && (
                        <span className="mr-2">{fee.duration_minutes} min</span>
                      )}
                      {fee.delivery_method && (
                        <span>{getDeliveryMethodLabel(fee.delivery_method)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-base">{formatPrice(fee.price, fee.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Counselling Section - New */}
      {groupFees.length > 0 && (
        <div className="">
          <hr className="border-grey-light mt-1 mb-6" />
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">For Group Counselling</h3>
            <div className="flex flex-col gap-1">
              {groupFees.map((fee, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-base">
                        {formatSessionCategory(fee.session_category)}
                      </span>
                    </div>
                    <div className="flex text-xs text-grey-medium">
                      {fee.duration_minutes && (
                        <span className="mr-2">{fee.duration_minutes} min</span>
                      )}
                      {fee.delivery_method && (
                        <span>{getDeliveryMethodLabel(fee.delivery_method)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-base">{formatPrice(fee.price, fee.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insurance Information (only on page view) */}
      {variant === "page" && (
        <div className="mt-2">
          <hr className="border-grey-light mt-1 mb-6" />
          <h3 className="text-xs mb-2">Insurance</h3>
          <p className="text-gray-700">
            Please contact the therapist directly to inquire about insurance coverage.
          </p>
        </div>
      )}
    </div>
  );
}
