"use client";
import React from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

export default function IndieHackerResults() {
  const { founders } = useIndieHacker();

  // Helper function to format MRR
  const formatMRR = (mrr: number | null) => {
    if (mrr === null) return "Unknown";
    return `$${mrr.toLocaleString()}`;
  };

  // Helper to extract domain from URL
  const extractDomain = (url: string) => {
    try {
      if (!url) return "";
      const domain = new URL(url).hostname.replace("www.", "");
      return domain;
    } catch (e) {
      return url;
    }
  };

  if (founders.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl border border-gray-200 bg-white">
        <div className="px-6 py-6 flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300 mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 15l8-8"></path>
            <path d="M16 15L8 7"></path>
          </svg>
          <p className="text-gray-600 text-sm mb-1 font-medium">No founders matched your query</p>
          <p className="text-gray-400 text-xs">Try searching for indie hackers or their products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 flex items-center gap-1">
          Matched
          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {founders.length}
          </span>
          founders
        </p>
      </div>

      {founders.map((founder) => (
        <div
          key={founder.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-gray-800 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {founder.first_name} {founder.last_name}
              </h3>
              {founder.similarity && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {Math.round(founder.similarity * 100)}% match
                </span>
              )}
            </div>

            {founder.total_estimated_mrr !== null && (
              <div className="mb-3">
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
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
                  MRR: {formatMRR(founder.total_estimated_mrr)}
                </span>
              </div>
            )}

            {founder.llm_founder_summary && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {founder.llm_founder_summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {founder.x_link && (
                <a
                  href={founder.x_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-gray-700 transition-colors inline-flex items-center border border-gray-200"
                >
                  <svg
                    className="w-3 h-3 mr-1.5 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  Twitter
                </a>
              )}

              {founder.raw_product_links && (
                <a
                  href={founder.raw_product_links.split(",")[0]?.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-gray-700 transition-colors inline-flex items-center border border-gray-200"
                >
                  <svg
                    className="w-3 h-3 mr-1.5 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {extractDomain(founder.raw_product_links.split(",")[0]?.trim())}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
