"use client";
import React, { useState } from "react";
import VideoEmbed, { TherapistVideo } from "./VideoEmbed";

interface VideoAccordionProps {
  videos: TherapistVideo[];
}

const VideoAccordion: React.FC<VideoAccordionProps> = ({ videos }) => {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  if (!videos || videos.length === 0) {
    return null;
  }

  // Sort videos by display order
  const sortedVideos = [...videos].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-4">
      {sortedVideos.map((video, index) => (
        <div key={video.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            className={`w-full px-4 py-3 text-left flex justify-between items-center transition-colors ${
              openIndex === index ? "bg-gray-50" : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            <span>{video.title || `Question ${index + 1}`}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                openIndex === index ? "rotate-180" : ""
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              openIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4">
              <VideoEmbed video={video} className="w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoAccordion;
