"use client";
import React, { useEffect, useState } from "react";
import InstagramEmbed from "@/app/components/InstagramEmbed";
import YouTubeEmbed from "@/app/components/YouTubeEmbed";

export interface TherapistVideo {
  id: string;
  url: string;
  platform: "youtube" | "instagram" | string;
  type: "intro" | "faq" | "testimonial" | string;
  title?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

type VideoEmbedProps =
  | {
      url: string;
      platform: string;
      title?: string;
      description?: string;
      className?: string;
    }
  | {
      video: TherapistVideo;
      className?: string;
    };

/**
 * VideoEmbed component that renders either an Instagram or YouTube embed
 * based on the platform prop
 */
export default function VideoEmbed(props: VideoEmbedProps) {
  const isVideoObject = "video" in props;

  // Extract properties based on whether we received a video object or individual props
  const url = isVideoObject ? props.video.url : props.url;
  const platform = isVideoObject ? props.video.platform : props.platform;
  const title = isVideoObject ? props.video.title : props.title;
  const description = isVideoObject ? props.video.description : props.description;
  const className = props.className || "";

  // For debugging
  useEffect(() => {
    console.log("[VideoEmbed] Props:", {
      isVideoObject,
      platform,
      url,
      platformType: typeof platform,
      platformLower: platform.toLowerCase(),
    });
  }, [isVideoObject, platform, url]);

  const handleError = () => {
    console.error(`[VideoEmbed] Error loading ${platform} embed for URL: ${url}`);
  };

  // Normalize platform string
  const platformLower = platform.toLowerCase();

  // Instagram embed
  if (platformLower === "instagram") {
    return (
      <div className={className}>
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        {description && <p className="text-gray-600 mb-2 text-sm">{description}</p>}
        <InstagramEmbed url={url} onError={handleError} className="mb-4" />
      </div>
    );
  }

  // YouTube embed
  if (platformLower === "youtube") {
    return (
      <div className={className}>
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        {description && <p className="text-gray-600 mb-2 text-sm">{description}</p>}
        <YouTubeEmbed url={url} onError={handleError} className="mb-4" />
      </div>
    );
  }

  // Fallback for unsupported platforms
  return (
    <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
      <p>Unsupported video platform: {platform}</p>
      <p className="text-sm mt-2">URL: {url}</p>
    </div>
  );
}
