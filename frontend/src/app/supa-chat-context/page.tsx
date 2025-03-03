'use client';
import React, { useState } from 'react';
import { TherapistProvider } from '../contexts/TherapistContext';
import FilterPanel from '../components/FilterPanel';
import ChatPanel from '../components/ChatPanel';
import TherapistResultsPanel from '../components/TherapistResultsPanel';

// Add custom scrollbar styles
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    scrollbar-color: #DDDBD3 transparent;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #DDDBD3;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #DDDBD9;
  }
  
  * {
    scrollbar-width: thin;
    scrollbar-color: #DDDBD3 transparent;
  }
`;

export default function SupaChatContextPage() {
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(true);

  return (
    <TherapistProvider>
      <style jsx global>
        {scrollbarStyles}
      </style>

      <div className="flex w-full h-full gap-4 overflow-hidden">
        {/* Filters - Collapsible */}
        <div
          className={`flex-none transition-all duration-300 ease-in-out ${
            isFilterExpanded ? 'w-1/4 max-w-[300px]' : 'w-[50px]'
          }`}
        >
          <div className="relative h-full">
            {/* Toggle Button */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="absolute -right-3 top-4 z-10 bg-white rounded-full p-1 shadow-md border"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isFilterExpanded ? 'rotate-0' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Filter Panel with overflow handling */}
            <div
              className={`h-full overflow-hidden transition-all duration-300 ${
                isFilterExpanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <FilterPanel />
            </div>
          </div>
        </div>

        {/* Therapist Results - 50% (center) */}
        <div className="bg-white flex-1 min-w-0">
          <TherapistResultsPanel />
        </div>

        {/* Chat - Collapsible */}
        <div
          className={`flex-none transition-all duration-300 ease-in-out ${
            isChatExpanded ? 'w-1/3 max-w-[500px]' : 'w-[50px]'
          }`}
        >
          <div className="relative h-full">
            {/* Toggle Button */}
            <button
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="absolute -left-3 top-4 z-10 bg-white rounded-full p-1 shadow-md border"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  isChatExpanded ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Chat Panel with overflow handling */}
            <div
              className={`h-full  overflow-hidden transition-all duration-300 ${
                isChatExpanded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
    </TherapistProvider>
  );
}
