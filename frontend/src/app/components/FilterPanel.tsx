"use client";
import React, { useState, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";

export default function FilterPanel() {
  const {
    filters,
    updateTherapists,
    isLoading,
    lastRequestTime,
    requestCount,
    isFormDisabled,
    isTherapistLoading,
    isChatLoading,
  } = useTherapist();

  // Local state for price inputs
  const [localPrices, setLocalPrices] = useState({
    initial: filters.max_price_initial || "",
    subsequent: filters.max_price_subsequent || "",
  });

  // Update local prices when filters change
  useEffect(() => {
    setLocalPrices({
      initial: filters.max_price_initial || "",
      subsequent: filters.max_price_subsequent || "",
    });
  }, [filters.max_price_initial, filters.max_price_subsequent]);

  // Toggle gender filter
  const toggleGender = (value) => {
    if (isFormDisabled) return;
    updateTherapists({
      type: "DIRECT",
      filters: { gender: filters.gender === value ? null : value },
    });
  };

  // Toggle array-based filters
  const toggleArrayFilter = (key, value) => {
    if (isFormDisabled) return;

    let newValues;
    if (!filters[key]) {
      newValues = [value];
    } else if (filters[key].includes(value)) {
      // Remove value if already selected
      newValues = filters[key].filter((v) => v !== value);
      if (newValues.length === 0) newValues = null;
    } else {
      // Add value if not already selected
      newValues = [...filters[key], value];
    }

    updateTherapists({
      type: "DIRECT",
      filters: { [key]: newValues },
    });
  };

  // Handle local price changes
  const handlePriceChange = (e, field) => {
    const value = e.target.value;
    setLocalPrices((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Only update context when user is done typing (on blur)
  const handlePriceBlur = (field) => {
    if (isFormDisabled) return;

    const value = localPrices[field];
    const numValue = value === "" ? null : Number(value);

    if (field === "initial") {
      updateTherapists({
        type: "DIRECT",
        filters: { max_price_initial: numValue },
      });
    } else {
      updateTherapists({
        type: "DIRECT",
        filters: { max_price_subsequent: numValue },
      });
    }
  };

  // Handle gender change with disabled check
  const handleGenderChange = (e) => {
    if (isFormDisabled) return; // Don't update if form is disabled
    updateTherapists({ gender: e.target.value || null });
  };

  // Handle availability change with disabled check
  const handleAvailabilityChange = (e) => {
    if (isFormDisabled) return; // Don't update if form is disabled
    updateTherapists({ availability: e.target.value || null });
  };

  // Handle reset with disabled check
  const handleReset = () => {
    if (isFormDisabled) return;
    updateTherapists({
      type: "DIRECT",
      filters: {
        gender: null,
        sexuality: null,
        ethnicity: null,
        faith: null,
        max_price_initial: null,
        max_price_subsequent: null,
        availability: null,
        format: null,
      },
    });
  };

  // Format timestamp for display
  const lastRequestTimeStr = lastRequestTime
    ? new Date(lastRequestTime).toLocaleTimeString()
    : "None";

  // Apply a disabled overlay if the form is disabled
  const formOverlay = isFormDisabled ? (
    <div className="absolute inset-0 bg-white-dark bg-opacity-50 z-10 flex items-center justify-center">
      <div className="bg-white p-3 rounded-lg shadow-md flex items-center">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
        <span>Processing...</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="bg-white-dark w-full h-full border p-4 overflow-y-auto relative">
      {formOverlay}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter Therapists</h2>
        <button
          onClick={handleReset}
          className={`text-sm text-blue-500 hover:text-blue-700 ${
            isFormDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isFormDisabled}
          aria-disabled={isFormDisabled}
        >
          Reset
        </button>
      </div>

      {/* Loading indicator */}
      {isTherapistLoading && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <span className="text-sm">Updating results...</span>
        </div>
      )}

      {/* Add Pricing Section with PriceDisplay */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">
          Price Range
        </h3>

        {/* Initial Session Price */}
        <div className="mb-4">
          <label
            htmlFor="initial-price"
            className="block text-base mb-1 text-grey-medium"
          >
            Max Initial Session Price
          </label>
          <div className="rounded-md border border-grey-light p-2 flex justify-between items-center">
            <div className="flex items-center flex-1">
              <input
                id="initial-price"
                type="number"
                min="0"
                step="5"
                className="w-full bg-transparent border-none focus:ring-0 text-base text-grey-extraDark"
                value={localPrices.initial}
                onChange={(e) => handlePriceChange(e, "initial")}
                onBlur={() => handlePriceBlur("initial")}
                placeholder="No limit"
                disabled={isFormDisabled}
              />
            </div>
            <div className="bg-beige-dark p-1 rounded-full flex items-center justify-center mr-1">
              <span className="text-xs text-grey-extraDark">$CAD</span>
            </div>
            <span className="text-grey-medium">/ session</span>
          </div>
        </div>

        {/* Subsequent Session Price */}
        <div>
          <label
            htmlFor="subsequent-price"
            className="block text-base mb-1 text-grey-medium"
          >
            Max Subsequent Session Price
          </label>
          <div className="rounded-md border border-grey-light p-2 flex justify-between items-center">
            <div className="flex items-center flex-1">
              <input
                id="subsequent-price"
                type="number"
                min="0"
                step="5"
                className="w-full bg-transparent border-none focus:ring-0 text-base text-grey-extraDark"
                value={localPrices.subsequent}
                onChange={(e) => handlePriceChange(e, "subsequent")}
                onBlur={() => handlePriceBlur("subsequent")}
                placeholder="No limit"
                disabled={isFormDisabled}
              />
            </div>
            <div className="bg-beige-dark p-1 rounded-full flex items-center justify-center mr-1">
              <span className="text-xs text-grey-extraDark">$CAD</span>
            </div>
            <span className="text-grey-medium">/ session</span>
          </div>
        </div>
      </div>

      {/* Gender Section */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">Gender</h3>
        <div className="flex flex-wrap gap-2">
          {["male", "female", "non_binary"].map((gender) => (
            <button
              key={gender}
              className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                filters.gender === gender
                  ? "bg-white border-green-extralight border-2"
                  : ""
              }`}
              onClick={() => toggleGender(gender)}
            >
              {gender === "non_binary"
                ? "Non-Binary"
                : gender.charAt(0).toUpperCase() + gender.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Method */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">
          Delivery Method
        </h3>
        <div className="flex flex-wrap gap-2">
          {["in_person", "online"].map((method) => (
            <button
              key={method}
              className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                filters.availability === method
                  ? "bg-white border-green-extralight border-2"
                  : ""
              }`}
              onClick={() =>
                updateTherapists({
                  type: "DIRECT",
                  filters: {
                    availability:
                      filters.availability === method ? null : method,
                  },
                })
              }
            >
              {method === "in_person" ? "In Person" : "Online"}
            </button>
          ))}
        </div>
      </div>

      {/* Therapy Format */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">
          Therapy Format
        </h3>
        <div className="flex flex-wrap gap-2">
          {["individual", "couples", "family"].map((format) => (
            <button
              key={format}
              className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                filters.format?.includes(format)
                  ? "bg-white border-green-extralight border-2"
                  : ""
              }`}
              onClick={() => toggleArrayFilter("format", format)}
            >
              {format.charAt(0).toUpperCase() + format.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Add Ethnicity Section */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">Ethnicity</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "asian",
            "black",
            "indigenous",
            "latino",
            "middle_eastern",
            "white",
          ].map((ethnicity) => (
            <button
              key={ethnicity}
              className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                filters.ethnicity?.includes(ethnicity)
                  ? "bg-white border-green-extralight border-2"
                  : ""
              }`}
              onClick={() => toggleArrayFilter("ethnicity", ethnicity)}
            >
              {ethnicity.charAt(0).toUpperCase() +
                ethnicity.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Add Sexuality Section */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">Sexuality</h3>
        <div className="flex flex-wrap gap-2">
          {["straight", "gay", "lesbian", "bisexual", "queer", "asexual"].map(
            (sexuality) => (
              <button
                key={sexuality}
                className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                  filters.sexuality?.includes(sexuality)
                    ? "bg-white border-green-extralight border-2"
                    : ""
                }`}
                onClick={() => toggleArrayFilter("sexuality", sexuality)}
              >
                {sexuality.charAt(0).toUpperCase() + sexuality.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Faith Section */}
      <div className="mb-6">
        <h3 className="text-sm mb-3 text-grey-medium font-medium">Faith</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "christian",
            "muslim",
            "jewish",
            "hindu",
            "buddhist",
            "sikh",
            "atheist",
          ].map((faith) => (
            <button
              key={faith}
              className={`px-2 py-1 rounded-md border text-grey-medium border-beige-dark font-base hover:bg-beige-extralight hover:shadow-sm focus:ring-2 focus:ring-green-light ${
                filters.faith?.includes(faith)
                  ? "bg-white border-green-extralight border-2"
                  : ""
              }`}
              onClick={() => toggleArrayFilter("faith", faith)}
            >
              {faith.charAt(0).toUpperCase() + faith.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
