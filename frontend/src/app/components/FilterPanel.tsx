"use client";
import React, { useState, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";

export default function FilterPanel() {
  const {
    filters,
    updateFilters,
    isLoading,
    lastRequestTime,
    requestCount,
    resetFilters,
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
    updateFilters({
      gender: filters.gender === value ? null : value,
    });
  };

  // Toggle array-based filters
  const toggleArrayFilter = (key, value) => {
    if (!filters[key]) {
      updateFilters({ [key]: [value] });
      return;
    }

    if (filters[key].includes(value)) {
      // Remove value if already selected
      const newValues = filters[key].filter((v) => v !== value);
      updateFilters({ [key]: newValues.length > 0 ? newValues : null });
    } else {
      // Add value if not already selected
      updateFilters({ [key]: [...filters[key], value] });
    }
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
    if (isFormDisabled) return; // Don't update if form is disabled

    const value = localPrices[field];
    const numValue = value === "" ? null : Number(value);

    if (field === "initial") {
      updateFilters({ max_price_initial: numValue });
    } else {
      updateFilters({ max_price_subsequent: numValue });
    }
  };

  // Handle gender change with disabled check
  const handleGenderChange = (e) => {
    if (isFormDisabled) return; // Don't update if form is disabled
    updateFilters({ gender: e.target.value || null });
  };

  // Handle availability change with disabled check
  const handleAvailabilityChange = (e) => {
    if (isFormDisabled) return; // Don't update if form is disabled
    updateFilters({ availability: e.target.value || null });
  };

  // Handle reset with disabled check
  const handleReset = () => {
    if (isFormDisabled) return; // Don't reset if form is disabled
    resetFilters();
  };

  // Format timestamp for display
  const lastRequestTimeStr = lastRequestTime
    ? new Date(lastRequestTime).toLocaleTimeString()
    : "None";

  // Debug loading states
  console.log("[FilterPanel] Rendering with states:", {
    isFormDisabled,
    isTherapistLoading,
    isChatLoading,
  });

  // Apply a disabled overlay if the form is disabled
  const formOverlay = isFormDisabled ? (
    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 z-10 flex items-center justify-center">
      <div className="bg-white p-3 rounded-lg shadow-md flex items-center">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
        <span>Processing...</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="w-full h-full border rounded-lg p-4 overflow-y-auto relative">
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
      <div className="space-y-2 mb-8">
        <h3>Request Stats</h3>
        <p className="text-sm">
          Total Requests: {requestCount}, Last Request: {lastRequestTimeStr}
        </p>
        <h3>State (Debugging)</h3>
        <p className="text-sm">
          Ethnicity: {filters.ethnicity?.join(", ")}, Gender: {filters.gender},
          Faith: {filters.faith?.join(", ")}, Max Initial Price:{" "}
          {filters.max_price_initial}, Max Subsequent Price:{" "}
          {filters.max_price_subsequent}, Availability: {filters.availability},
          Format: {filters.format?.join(", ")}, Sexuality:{" "}
          {filters.sexuality?.join(", ")}
        </p>
      </div>

      {/* Loading indicator */}
      {isTherapistLoading && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <span className="text-sm">Updating results...</span>
        </div>
      )}

      {/* Add Pricing Section */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="initial-price" className="block text-sm mb-1">
              Max Initial Session Price
            </label>
            <input
              id="initial-price"
              type="number"
              min="0"
              step="5"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={localPrices.initial}
              onChange={(e) => handlePriceChange(e, "initial")}
              onBlur={() => handlePriceBlur("initial")}
              placeholder="No limit"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="subsequent-price" className="block text-sm mb-1">
              Max Subsequent Session Price
            </label>
            <input
              id="subsequent-price"
              type="number"
              min="0"
              step="5"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={localPrices.subsequent}
              onChange={(e) => handlePriceChange(e, "subsequent")}
              onBlur={() => handlePriceBlur("subsequent")}
              placeholder="No limit"
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </div>

      {/* Gender Section */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Gender</h3>
        <div className="flex flex-wrap gap-2">
          {["male", "female", "non_binary"].map((gender) => (
            <button
              key={gender}
              className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                filters.gender === gender ? "bg-blue-100 border-blue-500" : ""
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
        <h3 className="font-medium mb-3">Delivery Method</h3>
        <div className="flex flex-wrap gap-2">
          {["in_person", "online"].map((method) => (
            <button
              key={method}
              className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                filters.availability === method
                  ? "bg-blue-100 border-blue-500"
                  : ""
              }`}
              onClick={() =>
                updateFilters({
                  availability: filters.availability === method ? null : method,
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
        <h3 className="font-medium mb-3">Therapy Format</h3>
        <div className="flex flex-wrap gap-2">
          {["individual", "couples", "family"].map((format) => (
            <button
              key={format}
              className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                filters.format?.includes(format)
                  ? "bg-blue-100 border-blue-500"
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
        <h3 className="font-medium mb-3">Ethnicity</h3>
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
              className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                filters.ethnicity?.includes(ethnicity)
                  ? "bg-blue-100 border-blue-500"
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
        <h3 className="font-medium mb-3">Sexuality</h3>
        <div className="flex flex-wrap gap-2">
          {["straight", "gay", "lesbian", "bisexual", "queer", "asexual"].map(
            (sexuality) => (
              <button
                key={sexuality}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  filters.sexuality?.includes(sexuality)
                    ? "bg-blue-100 border-blue-500"
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
        <h3 className="font-medium mb-3">Faith</h3>
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
              className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                filters.faith?.includes(faith)
                  ? "bg-blue-100 border-blue-500"
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
