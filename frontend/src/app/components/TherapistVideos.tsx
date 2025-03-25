"use client";
import React, { useEffect } from "react";
import VideoEmbed, { TherapistVideo } from "@/app/components/VideoEmbed";
import VideoAccordion from "@/app/components/VideoAccordion";
import VideoCarousel from "@/app/components/VideoCarousel";

interface TherapistVideosProps {
  videos: TherapistVideo[];
  variant?: "modal" | "page";
  type?: "intro" | "faq" | "testimonial";
}

/**
 * Component to display therapist videos organized by type
 * Different UI treatments for different video types:
 * - Intro videos: Simple list, displayed above bio
 * - FAQ videos: Accordion style, displayed after bio
 * - Testimonial videos: Carousel with 2 columns, displayed after FAQ
 */
export const TherapistVideos: React.FC<TherapistVideosProps> = ({
  videos = [],
  variant = "page",
  type,
}) => {
  // Enhanced debug logging
  useEffect(() => {
    console.log("[TherapistVideos] Received videos:", videos);
    if (videos.length > 0) {
      // Check if is_active is present in the video objects
      const hasIsActive = videos.some((v) => "is_active" in v);
      console.log("[TherapistVideos] is_active field present:", hasIsActive);

      // Log active vs inactive videos
      const activeCount = videos.filter((v) => v.is_active !== false).length;
      const inactiveCount = videos.filter((v) => v.is_active === false).length;
      console.log(
        `[TherapistVideos] Active: ${activeCount}, Inactive: ${inactiveCount}, Total: ${videos.length}`
      );
    }
  }, [videos]);

  if (!videos || videos.length === 0) {
    return null;
  }

  // First filter out inactive videos
  const activeVideos = videos.filter((v) => v.is_active !== false);

  // Log which videos were filtered out
  if (activeVideos.length < videos.length) {
    console.log(
      `[TherapistVideos] Filtered out ${videos.length - activeVideos.length} inactive videos`
    );
    console.log(
      "[TherapistVideos] Inactive videos:",
      videos.filter((v) => v.is_active === false)
    );
  }

  if (activeVideos.length === 0) {
    return null;
  }

  // If specific type is requested, only render that type
  const filteredVideos = type ? activeVideos.filter((v) => v.type === type) : activeVideos;

  if (filteredVideos.length === 0) {
    return null;
  }

  // Group videos by type if no specific type is requested
  if (!type) {
    const introVideos = activeVideos.filter((v) => v.type === "intro");
    const faqVideos = activeVideos.filter((v) => v.type === "faq");
    const testimonialVideos = activeVideos.filter((v) => v.type === "testimonial");

    // If we're showing all types, we're likely in a content area with sections
    return (
      <div>
        {/* Do not render intro videos here - they should be above the bio */}

        {/* FAQ videos with accordion */}
        {faqVideos.length > 0 && (
          <div className="mb-8">
            <h3 className="font-medium text-xl mb-4">Frequently Asked Questions</h3>
            <VideoAccordion videos={faqVideos} />
          </div>
        )}

        {/* Testimonial videos with carousel */}
        {testimonialVideos.length > 0 && (
          <div className="mb-8">
            <h3 className="font-medium text-xl mb-4">Testimonials</h3>
            <VideoCarousel videos={testimonialVideos} />
          </div>
        )}
      </div>
    );
  }

  // For specific type rendering:

  // Intro videos: Simple list
  if (type === "intro") {
    return (
      <div className={`mb-6 ${variant === "modal" ? "px-0" : ""}`}>
        <div className="space-y-6">
          {filteredVideos
            .sort((a, b) => a.display_order - b.display_order)
            .map((video) => (
              <VideoEmbed key={video.id} video={video} className="w-full" />
            ))}
        </div>
      </div>
    );
  }

  // FAQ videos: Accordion
  if (type === "faq") {
    return (
      <div className={`mb-6 ${variant === "modal" ? "px-0" : ""}`}>
        <VideoAccordion videos={filteredVideos} />
      </div>
    );
  }

  // Testimonial videos: Carousel
  if (type === "testimonial") {
    return (
      <div className={`mb-6 ${variant === "modal" ? "px-0" : ""}`}>
        <VideoCarousel videos={filteredVideos} />
      </div>
    );
  }

  return null;
};
