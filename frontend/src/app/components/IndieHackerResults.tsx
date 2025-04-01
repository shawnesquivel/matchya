"use client";
import React from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";
import { Founder } from "../contexts/IndieHackerContext";

export default function IndieHackerResults() {
  const { founders } = useIndieHacker();

  if (founders.length === 0) {
    return (
      <div className="border-t border-gray-200 p-4">
        <p className="text-gray-500 text-center py-4">
          No founders matched your query. Try asking about indie hackers or their products.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <h2 className="text-lg font-medium mb-4">Matched Founders ({founders.length})</h2>
      <div className="space-y-4">
        {founders.map((founder: Founder) => (
          <div key={founder.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <h3 className="font-medium">
                {founder.first_name} {founder.last_name}
              </h3>
              <div className="text-sm text-blue-500">
                {founder.similarity ? `${(founder.similarity * 100).toFixed(1)}% match` : ""}
              </div>
            </div>

            {founder.total_estimated_mrr && (
              <div className="text-sm text-green-600 font-medium mt-1">
                ${founder.total_estimated_mrr.toLocaleString()} MRR
              </div>
            )}

            {founder.x_link && (
              <div className="text-sm text-gray-500 mt-1">
                <a
                  href={founder.x_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {founder.x_link}
                </a>
              </div>
            )}

            {founder.raw_product_links && (
              <div className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Products: </span>
                {founder.raw_product_links.split(",").map((link, i) => (
                  <a
                    key={i}
                    href={link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mr-2"
                  >
                    {new URL(link.trim()).hostname.replace("www.", "")}
                  </a>
                ))}
              </div>
            )}

            {founder.llm_founder_summary && (
              <div className="text-sm text-gray-700 mt-2">
                {founder.llm_founder_summary.length > 200
                  ? founder.llm_founder_summary.substring(0, 200) + "..."
                  : founder.llm_founder_summary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
