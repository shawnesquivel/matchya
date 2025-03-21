"use client";
import React, { useState, useEffect, useRef } from "react";
import VideoEmbed, { TherapistVideo } from "./VideoEmbed";

interface VideoCarouselProps {
  videos: TherapistVideo[];
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    // Initial check
    checkMobile();

    // Add window resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!videos || videos.length === 0) {
    return null;
  }

  // Sort videos by display order
  const sortedVideos = [...videos].sort((a, b) => a.display_order - b.display_order);

  // Calculate items per page based on screen size
  const itemsPerPage = isMobile ? 1 : 2;

  const moveToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerPage >= sortedVideos.length ? 0 : prevIndex + itemsPerPage
    );
  };

  const moveToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsPerPage < 0
        ? Math.max(0, sortedVideos.length - itemsPerPage)
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
  }, [itemsPerPage]); // Add itemsPerPage as dependency

  // Display videos based on current page and screen size
  const visibleVideos = sortedVideos.slice(currentIndex, currentIndex + itemsPerPage);
  const hasMultipleVideos = sortedVideos.length > itemsPerPage;

  // Number of pages for pagination
  const pageCount = Math.ceil(sortedVideos.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  return (
    <div ref={containerRef} className="w-full relative" tabIndex={0}>
      {/* Mobile navigation buttons - on top */}
      {isMobile && hasMultipleVideos && (
        <div className="flex justify-between mb-4">
          <button
            onClick={moveToPrev}
            className="bg-white rounded-full p-2 shadow-md"
            aria-label="Previous testimonial"
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

          <span className="self-center text-sm text-gray-500">
            {currentPage + 1} of {pageCount}
          </span>

          <button
            onClick={moveToNext}
            className="bg-white rounded-full p-2 shadow-md"
            aria-label="Next testimonial"
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
        </div>
      )}

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ease-in-out">
        {visibleVideos.map((video) => (
          <div key={video.id} className="w-full overflow-hidden">
            <VideoEmbed video={video} className="w-full" />
          </div>
        ))}
      </div>

      {/* Desktop navigation - positioned on sides */}
      {!isMobile && hasMultipleVideos && (
        <>
          <button
            onClick={moveToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 bg-white rounded-full p-2 shadow-md"
            aria-label="Previous testimonials"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 bg-white rounded-full p-2 shadow-md"
            aria-label="Next testimonials"
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
        </>
      )}

      {/* Pagination indicators */}
      {hasMultipleVideos && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentPage === index ? "bg-gray-800 w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoCarousel;
