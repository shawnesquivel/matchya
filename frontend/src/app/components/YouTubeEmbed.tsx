"use client";
import React, { useState, useEffect } from "react";

interface YouTubeEmbedProps {
  url: string;
  onError?: () => void;
  className?: string;
}

/**
 * Component to embed YouTube videos
 */
export default function YouTubeEmbed({ url, onError, className = "" }: YouTubeEmbedProps) {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Extract video ID from various YouTube URL formats
      const extractVideoId = (youtubeUrl: string): string | null => {
        // Match youtube.com/watch?v=VIDEO_ID
        let match = youtubeUrl.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (match && match[1]) return match[1];

        // Match youtu.be/VIDEO_ID
        match = youtubeUrl.match(/youtu\.be\/([^?]+)/);
        if (match && match[1]) return match[1];

        // Match youtube.com/embed/VIDEO_ID
        match = youtubeUrl.match(/youtube\.com\/embed\/([^?]+)/);
        if (match && match[1]) return match[1];

        return null;
      };

      const id = extractVideoId(url);
      setVideoId(id);

      if (!id && onError) {
        onError();
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      if (onError) onError();
    }
  }, [url, onError]);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 p-4 text-center rounded-lg ${className}`}>
        <p className="text-gray-500">Unable to load YouTube video</p>
        <p className="text-sm text-gray-400 mt-1 break-all">{url}</p>
      </div>
    );
  }

  return (
    <div className={`youtube-embed relative overflow-hidden ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          loading="lazy"
          onError={() => onError?.()}
        ></iframe>
      </div>
    </div>
  );
}
