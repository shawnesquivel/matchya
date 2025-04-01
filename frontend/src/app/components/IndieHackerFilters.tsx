"use client";
import React, { useState, useEffect } from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

export default function IndieHackerFilters() {
  const { filters, updateFilters } = useIndieHacker();
  const [minMrr, setMinMrr] = useState<string>("");
  const [maxMrr, setMaxMrr] = useState<string>("");

  // Initialize local state from filters
  useEffect(() => {
    setMinMrr(filters.minMrr !== null ? String(filters.minMrr) : "");
    setMaxMrr(filters.maxMrr !== null ? String(filters.maxMrr) : "");
  }, [filters.minMrr, filters.maxMrr]);

  // Apply filters when user clicks the button
  const applyFilters = () => {
    updateFilters({
      minMrr: minMrr ? Number(minMrr) : null,
      maxMrr: maxMrr ? Number(maxMrr) : null,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setMinMrr("");
    setMaxMrr("");
    updateFilters({
      minMrr: null,
      maxMrr: null,
    });
  };

  return (
    <div className="mx-4 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="space-y-5">
        <div>
          <label
            htmlFor="minMrr"
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Minimum MRR
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="minMrr"
              value={minMrr}
              onChange={(e) => setMinMrr(e.target.value)}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="maxMrr"
            className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Maximum MRR
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="maxMrr"
              value={maxMrr}
              onChange={(e) => setMaxMrr(e.target.value)}
              placeholder="No limit"
              className="w-full pl-7 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-md focus:outline-none transition-all duration-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none transition-all duration-200 border border-gray-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
