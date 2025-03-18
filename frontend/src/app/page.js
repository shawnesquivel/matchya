"use client";
import React, { useState, useEffect, useRef } from "react";
import { TherapistProvider } from "./contexts/TherapistContext";
import FilterPanel from "./components/FilterPanel";
import ChatPanel from "./components/ChatPanel";
import TherapistResultsPanel from "./components/TherapistResultsPanel";
import Image from "next/image";

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
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768; // Common breakpoint for mobile devices
};

export default function SupaChatContextPage() {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile-specific states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [chatDrawerState, setChatDrawerState] = useState("minimized"); // "closed", "minimized", "open"
  const [customHeight, setCustomHeight] = useState(null); // Track custom height when dragging
  const [isDragging, setIsDragging] = useState(false); // Track if currently dragging
  const dragStartY = useRef(0); // Starting Y position for drag
  const startHeight = useRef(0); // Starting height for drag
  const chatDrawerRef = useRef(null); // Reference to the chat drawer

  // Check for mobile device on first render and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobileDetected = isMobileDevice();
      setIsMobile(mobileDetected);
      // Reset filter when switching between desktop and mobile
      if (mobileDetected !== isMobile) {
        setIsFilterOpen(false);
        setChatDrawerState("closed"); // Default to closed
        setCustomHeight(null);
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  // Effect to prevent background scrolling when chat is open
  useEffect(() => {
    // Only apply on mobile
    if (!isMobile) return;
    
    // Prevent body scrolling when chat is open or minimized
    if (chatDrawerState !== "closed") {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, chatDrawerState]);

  // Toggle chat drawer state
  const toggleChatDrawer = () => {
    // Reset custom height when using the toggle button
    setCustomHeight(null);
    
    // Cycle through states: closed -> minimized -> open -> minimized -> closed
    if (chatDrawerState === "closed") {
      setChatDrawerState("minimized");
    } else if (chatDrawerState === "minimized") {
      setChatDrawerState("open");
    } else {
      setChatDrawerState("minimized");
    }
  };
  
  // Function to close chat drawer
  const closeChat = (e) => {
    e.stopPropagation();
    setChatDrawerState("closed");
    setCustomHeight(null);
  };
  
  // Toggle filter panel for mobile
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Get the height style for the chat drawer
  const getChatDrawerHeight = () => {
    if (customHeight !== null) {
      return `${customHeight}px`;
    }
    
    if (chatDrawerState === "closed") return "48px"; // h-12
    if (chatDrawerState === "minimized") return "30vh";
    return "75vh";
  };

  return (
    <div className="relative min-h-screen w-full bg-white">
      <style jsx global>
        {`
          ${scrollbarStyles}
          
          /* Prevent zoom on focus */
          @viewport {
            width: device-width;
            zoom: 1.0;
            min-zoom: 1.0;
            max-zoom: 1.0;
            user-zoom: fixed;
          }
          
          input[type="text"],
          input[type="search"],
          input[type="email"],
          input[type="password"],
          textarea {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
          
          /* Drag handle styling */
          .drag-handle {
            touch-action: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
            z-index: 100;
          }
          
          .drag-handle .handle-bar {
            transition: background-color 0.2s;
          }
          
          .drag-handle:hover .handle-bar {
            background-color: #999 !important;
          }
          
          /* Prevent page scrolling during drag */
          body.dragging-chat {
            overflow: hidden;
            touch-action: none;
          }
        `}
      </style>

      <TherapistProvider>
        {isMobile ? (
          /* Mobile Layout */
          <div className="flex flex-col h-screen relative overflow-hidden">
            {/* Main content area */}
            <div className="flex-grow overflow-y-auto">
              {/* Top Bar with Logo and Filter Toggle */}
              <div className="flex items-center justify-between p-3 border-b shadow-sm">
                <div className="h-8 w-auto">
                  <Image
                    src="/assets/images/matchyalogo.png"
                    alt="Matchya Logo"
                    width={120}
                    height={36}
                    priority
                    className="object-contain"
                  />
                </div>
                
                <button 
                  onClick={toggleFilterPanel}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 focus:outline-none"
                  aria-label="Toggle filters"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 6a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" />
                  </svg>
                </button>
              </div>
              
              <TherapistResultsPanel />
            </div>
            
            {/* Filter Panel Drawer */}
            <div className={`fixed inset-y-0 left-0 transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 w-11/12 max-w-md bg-white-dark`}>
              <div className="h-full flex flex-col">
                <div className="p-4 flex justify-between items-center border-grey-light">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button 
                    onClick={toggleFilterPanel} 
                    className="w-8 h-8 flex items-center justify-center text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <FilterPanel />
                </div>
              </div>
            </div>
            
            {/* Overlay when filter is open */}
            {isFilterOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleFilterPanel}
              />
            )}
            
            {/* Chat Drawer */}
            <div 
              ref={chatDrawerRef}
              className="z-[21] bg-white-dark chat-drawer fixed bottom-0 left-0 right-0 border border-grey-light rounded-t-xl "
              style={{ 
                height: getChatDrawerHeight(),
                transition: isDragging ? 'none' : 'height 0.3s ease-in-out'
              }}
            >
              {/* Chat Header with drag handle */}
              <div 
                className="chat-header h-12 border-b select-none relative"
                onClick={(e) => {
                  // Don't allow toggling while dragging
                  if (!isDragging) {
                    toggleChatDrawer();
                  }
                }}
              >
                {/* Drag Handle */}
                <div 
                  className="drag-handle absolute top-0 left-0 right-0 h-12 flex flex-col items-center justify-start p-2 cursor-ns-resize"
                  ref={(el) => {
                    if (el) {
                      el.addEventListener('touchstart', (e) => {
                        // If chat is closed, open it to minimized first
                        if (chatDrawerState === "closed") {
                          setChatDrawerState("minimized");
                        }
                        dragStartY.current = e.touches[0].clientY;
                        startHeight.current = chatDrawerRef.current?.offsetHeight || 200;
                        setIsDragging(true);
                      }, { passive: true });

                      el.addEventListener('touchmove', (e) => {
                        e.preventDefault();
                        // Only handle drag if not closed
                        if (chatDrawerState === "closed") return;
                        
                        const currentY = e.touches[0].clientY;
                        const deltaY = dragStartY.current - currentY;
                        let newHeight = startHeight.current + deltaY;
                        const minHeight = 50;
                        const maxHeight = window.innerHeight * 0.9;
                        newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
                        setCustomHeight(newHeight);
                      }, { passive: false });

                      el.addEventListener('touchend', () => {
                        setIsDragging(false);
                      }, { passive: true });
                    }
                  }}
                  onMouseDown={(e) => {
                    if (chatDrawerState === "closed") {
                      setChatDrawerState("minimized");
                      return;
                    }
                    
                    dragStartY.current = e.clientY;
                    startHeight.current = chatDrawerRef.current?.offsetHeight || 200;
                    setIsDragging(true);
                    
                    const handleMouseMove = (e) => {
                      if (!isDragging) return;
                      
                      e.preventDefault();
                      const deltaY = dragStartY.current - e.clientY;
                      
                      let newHeight = startHeight.current + deltaY;
                      const minHeight = 50;
                      const maxHeight = window.innerHeight * 0.9;
                      newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
                      
                      setCustomHeight(newHeight);
                    };
                    
                    const handleMouseUp = () => {
                      setIsDragging(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="handle-bar w-16 h-0.5 bg-gray-400 rounded-full"></div>
                </div>
                
                {/* Header content */}
                <div className="h-12 flex items-center justify-between px-4 relative z-10 pointer-events-none">
                  <div className="flex items-center pointer-events-auto">

                    <span className="font-medium">Chat with Matchya</span>
                  </div>
                  
                  {/* Control buttons - with pointer-events-auto */}
                  <div className="pointer-events-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (chatDrawerState === "closed") {
                          setChatDrawerState("minimized");
                        } else if (chatDrawerState === "open") {
                          setChatDrawerState("closed");
                        } else {
                          setChatDrawerState("closed");
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={chatDrawerState === "open" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Chat Content */}
              {chatDrawerState !== "closed" && (
                <div className="chat-content flex-grow overflow-y-auto h-[calc(100%-48px)]">
                  <ChatPanel />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex w-full h-full gap-4 overflow-hidden">
            {/* Filters - Collapsible */}
            <div
              className={`flex-none transition-all duration-300 ease-in-out ${
                isFilterExpanded ? "w-1/4 max-w-[300px]" : "w-[50px]"
              }`}
            >
              <div className="relative h-full">
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="absolute -right-3 top-20 z-10 bg-white rounded-full p-1 shadow-md border"
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
        )}
      </TherapistProvider>
    </div>
  );
}
