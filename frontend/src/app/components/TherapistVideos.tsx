"use client";
import React, { useEffect } from "react";
import VideoEmbed, { TherapistVideo } from "@/app/components/VideoEmbed";

interface TherapistVideosProps {
  videos: TherapistVideo[];
  variant?: "modal" | "page";
}

/**
 * Component to display therapist videos organized by type
 * All videos are now shown by default without collapsible sections
 */
export const TherapistVideos: React.FC<TherapistVideosProps> = ({
  videos = [],
  variant = "page",
}) => {
  // Add debug logging
  useEffect(() => {
    console.log("[TherapistVideos] Received videos:", videos);
  }, [videos]);

  if (!videos || videos.length === 0) {
    return null;
  }

  // Group videos by type
  const introVideos = videos.filter((v) => v.type === "intro");
  const faqVideos = videos.filter((v) => v.type === "faq");
  const testimonialVideos = videos.filter((v) => v.type === "testimonial");

  // Sort videos by display order
  const sortByOrder = (a: TherapistVideo, b: TherapistVideo) => a.display_order - b.display_order;

  return (
    <div className={`therapist-videos ${variant === "modal" ? "px-0" : "px-4"}`}>
      {/* Introduction videos */}
      {introVideos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-xl mb-3">Introduction</h3>
          <div className="space-y-6">
            {introVideos.sort(sortByOrder).map((video) => (
              <VideoEmbed key={video.id} video={video} className="w-full" />
            ))}
          </div>
        </div>
      )}

      {/* FAQ videos */}
      {faqVideos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-xl mb-3">Frequently Asked Questions</h3>
          <div className={`grid grid-cols-1 ${faqVideos.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
            {faqVideos.sort(sortByOrder).map((video) => (
              <VideoEmbed key={video.id} video={video} className="w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Testimonial videos */}
      {testimonialVideos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-xl mb-3">Testimonials</h3>
          <div
            className={`grid grid-cols-1 ${
              testimonialVideos.length > 1 ? "md:grid-cols-2" : ""
            } gap-4`}
          >
            {testimonialVideos.sort(sortByOrder).map((video) => (
              <VideoEmbed key={video.id} video={video} className="w-full" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
