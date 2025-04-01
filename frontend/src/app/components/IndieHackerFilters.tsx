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
    <div className="border rounded-lg p-4 bg-gray-50 mb-4">
      <h2 className="text-lg font-medium mb-4">Filter by MRR</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="minMrr" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum MRR ($)
          </label>
          <input
            type="number"
            id="minMrr"
            value={minMrr}
            onChange={(e) => setMinMrr(e.target.value)}
            placeholder="Min MRR"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxMrr" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum MRR ($)
          </label>
          <input
            type="number"
            id="maxMrr"
            value={maxMrr}
            onChange={(e) => setMaxMrr(e.target.value)}
            placeholder="Max MRR"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
