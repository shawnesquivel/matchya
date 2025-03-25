"use client";
import React, { useState, useEffect, useRef } from "react";
import { TherapistPrompt } from "./TherapistPromptCards";

interface TherapistPromptCarouselProps {
  prompts: TherapistPrompt[];
}

const StickyNoteCard: React.FC<{ prompt: TherapistPrompt; color: string }> = ({
  prompt,
  color,
}) => (
  <div
    className={`flex flex-col gap-6 align-middle justify-center aspect-square p-10 shadow-sm transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${color}`}
  >
    <h3 className="text-xl font-light font-new-spirit mb-3 text-gray-800 -rotate-2 text-center">
      {prompt.question}
    </h3>
    <p className="text-gray-600 text-sm whitespace-pre-line line-clamp-6 text-center">
      {prompt.answer}
    </p>
  </div>
);

export default function TherapistPromptCarousel({ prompts }: TherapistPromptCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No prompts answered yet.</p>
      </div>
    );
  }

  // Sort prompts by category
  const sortedPrompts = [...prompts].sort((a, b) => {
    const categoryOrder = ["personal", "therapeutic", "fun"];
    return categoryOrder.indexOf(a.category_name) - categoryOrder.indexOf(b.category_name);
  });

  // Define sticky note colors based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personal":
        return "bg-yellow";
      case "therapeutic":
        return "bg-purple";
      case "fun":
        return "bg-green-muted";
      default:
        return "bg-yellow";
    }
  };

  const itemsPerPage = isMobile ? 1 : 3;
  const pageCount = Math.ceil(sortedPrompts.length / itemsPerPage);

  const moveToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerPage >= sortedPrompts.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const moveToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsPerPage < 0
        ? Math.max(0, sortedPrompts.length - itemsPerPage)
        : prevIndex - itemsPerPage
    );
  };

  // Add keyboard event listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          moveToPrev();
        } else if (e.key === "ArrowRight") {
          moveToNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemsPerPage]);

  const visiblePrompts = sortedPrompts.slice(currentIndex, currentIndex + itemsPerPage);
  const hasMultiplePrompts = sortedPrompts.length > itemsPerPage;
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  return (
    <div ref={containerRef} className="w-full relative" tabIndex={0}>
      {/* Navigation buttons - now positioned at top left */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={moveToPrev}
          className="bg-[#E4E5D3] rounded-full p-2 hover:bg-[#E0E3BF] transition-bg"
          aria-label="Previous prompts"
        >
          <svg
            className="w-5 h-5"
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
        <button
          onClick={moveToNext}
          className="bg-[#E4E5D3] rounded-full p-2 hover:bg-[#E0E3BF] transition-bg"
          aria-label="Next prompts"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Current page indicator */}
        <span className="self-center text-sm text-gray-500 ml-2">
          {currentPage + 1} of {pageCount}
        </span>
      </div>

      {/* Sticky notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-300 ease-in-out">
        {visiblePrompts.map((prompt) => (
          <StickyNoteCard
            key={prompt.id}
            prompt={prompt}
            color={getCategoryColor(prompt.category_name)}
          />
        ))}
      </div>

      {/* Pagination indicators */}
      {hasMultiplePrompts && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
              className={`w-1 h-1 rounded-full transition-all ${
                currentPage === index ? "bg-gray-800 w-4" : "bg-[#E4E5D3]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
