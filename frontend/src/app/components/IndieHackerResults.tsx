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
      <div className="text-center py-8 px-4">
        <p className="text-gray-500 text-sm mb-2">No founders matched your query.</p>
        <p className="text-gray-400 text-xs">Try asking about indie hackers or their products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Matched <span className="font-semibold">{founders.length}</span> founders
      </p>

      {founders.map((founder) => (
        <div
          key={founder.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-blue-700">
                {founder.first_name} {founder.last_name}
              </h3>
              {founder.similarity && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {Math.round(founder.similarity * 100)}% match
                </span>
              )}
            </div>

            {founder.total_estimated_mrr !== null && (
              <div className="mb-2 flex items-center">
                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  MRR: {formatMRR(founder.total_estimated_mrr)}
                </span>
              </div>
            )}

            {founder.llm_founder_summary && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                {founder.llm_founder_summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {founder.x_link && (
                <a
                  href={founder.x_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700 transition-colors inline-flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
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
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700 transition-colors inline-flex items-center"
                >
                  <svg
                    className="w-3 h-3 mr-1"
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
