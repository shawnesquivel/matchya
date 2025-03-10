"use client";
import React, { useState, useEffect } from "react";
import { TherapistProvider } from "./contexts/TherapistContext";
import FilterPanel from "./components/FilterPanel";
import ChatPanel from "./components/ChatPanel";
import TherapistResultsPanel from "./components/TherapistResultsPanel";

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

// Mobile detection function
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Common breakpoint for mobile devices
};

export default function SupaChatContextPage() {
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile device on first render and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-white">
      <style jsx global>
        {scrollbarStyles}
      </style>
      
      {/* Mobile Restriction Overlay */}
      {isMobile && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-gray-400">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12" y2="18.01"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Mobile Version Not Available</h1>
          <p className="text-gray-600 mb-4">
            Matchya is currently only available on desktop. Please visit us on a larger screen for the full experience.
          </p>
          <p className="text-sm text-gray-500">
            We're working on making Matchya available on mobile devices soon.
          </p>
        </div>
      )}

      {/* Main App Content - Original Desktop Layout */}
      <TherapistProvider>
        <div className="flex w-full h-full gap-4 overflow-hidden">
          {/* Filters - Collapsible */}
          <div
            className={`flex-none transition-all duration-300 ease-in-out ${
              isFilterExpanded ? "w-1/4 max-w-[300px]" : "w-[50px]"
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
                    isFilterExpanded ? "rotate-0" : "rotate-180"
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
                  isFilterExpanded ? "opacity-100" : "opacity-0"
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
              isChatExpanded ? "w-1/3 max-w-[500px]" : "w-[50px]"
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
                    isChatExpanded ? "rotate-180" : "rotate-0"
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
                className={`h-full overflow-hidden transition-all duration-300 ${
                  isChatExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                <ChatPanel />
              </div>
            </div>
          </div>
        </div>
      </TherapistProvider>
    </div>
  );
}
