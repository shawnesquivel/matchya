"use client";
import React from "react";
import Image from "next/image";

interface TherapyRating {
  thinking: number; // 1-5 stars
  feeling: number; // 1-5 stars
  action: number; // 1-5 stars
}

interface TherapyType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  isAvailable: boolean;
  comingSoon?: boolean;
  ratings: TherapyRating;
}

interface TherapySelectorProps {
  onTherapySelect: (therapyType: string) => void;
}

const THERAPY_TYPES: TherapyType[] = [
  {
    id: "cbt",
    name: "Cognitive Behavioral Therapy",
    shortName: "CBT",
    description:
      "Focus on changing negative thought patterns and behaviors through evidence-based techniques.",
    isAvailable: true,
    ratings: {
      thinking: 5,
      feeling: 3,
      action: 4,
    },
  },
  {
    id: "ifs",
    name: "Internal Family Systems",
    shortName: "IFS",
    description: "Working with different parts of yourself to promote healing and self-leadership.",
    isAvailable: false,
    comingSoon: true,
    ratings: {
      thinking: 3,
      feeling: 5,
      action: 2,
    },
  },
  {
    id: "dbt",
    name: "Dialectical Behavior Therapy",
    shortName: "DBT",
    description: "Building skills for emotion regulation, distress tolerance, and mindfulness.",
    isAvailable: false,
    comingSoon: true,
    ratings: {
      thinking: 4,
      feeling: 4,
      action: 5,
    },
  },
  {
    id: "emdr",
    name: "EMDR Therapy",
    shortName: "EMDR",
    description: "Processing trauma and difficult memories through guided bilateral stimulation.",
    isAvailable: false,
    comingSoon: true,
    ratings: {
      thinking: 2,
      feeling: 5,
      action: 3,
    },
  },
];

// Star rating component for compact display
function StarRating({ rating, maxStars = 5 }: { rating: number; maxStars?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} className={`text-xs ${i < rating ? "text-yellow-400" : "text-grey-light"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

// Therapy ratings display component
function TherapyRatings({ ratings }: { ratings: TherapyRating }) {
  return (
    <div className="space-y-2 text-xs text-grey-medium mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🧠</span>
          <span>Thinking-Based</span>
        </div>
        <StarRating rating={ratings.thinking} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>💙</span>
          <span>Feeling-Based</span>
        </div>
        <StarRating rating={ratings.feeling} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>⚡</span>
          <span>Action-Based</span>
        </div>
        <StarRating rating={ratings.action} />
      </div>
    </div>
  );
}

// Individual therapy card component
function TherapyCard({
  therapy,
  onSelect,
}: {
  therapy: TherapyType;
  onSelect: (id: string) => void;
}) {
  const handleClick = () => {
    if (therapy.isAvailable) {
      onSelect(therapy.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (therapy.isAvailable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(therapy.id);
    }
  };

  // All cards look the same - neutral styling with green hover effects
  return (
    <div
      className="bg-white rounded-lg p-6 border border-grey-light shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-green-light"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={therapy.isAvailable ? 0 : -1}
      role="button"
      aria-label={
        therapy.isAvailable
          ? `Start ${therapy.name} session`
          : `${therapy.name} - not available yet`
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-mblack group-hover:text-green-dark transition-colors duration-200">
          {therapy.name}
        </h3>
        <span className="text-sm bg-beige-light text-grey-medium group-hover:bg-green-light group-hover:text-green-dark px-3 py-1 rounded-full font-medium transition-colors duration-200">
          {therapy.isAvailable ? "Available" : "Coming Soon"}
        </span>
      </div>
      <p className="text-grey-medium mb-4 text-sm leading-relaxed group-hover:text-mblack transition-colors duration-200">
        {therapy.description}
      </p>

      {/* Therapy approach ratings */}
      <TherapyRatings ratings={therapy.ratings} />

      <button
        className="w-full bg-beige-light text-mblack hover:bg-green hover:text-white py-3 px-4 rounded-full font-medium transition-colors duration-200 group-hover:bg-green group-hover:text-white"
        disabled={!therapy.isAvailable}
        aria-label={`Start ${therapy.shortName} session`}
      >
        Start {therapy.shortName} Session
      </button>
    </div>
  );
}

// Main therapy selector component
export default function TherapySelector({ onTherapySelect }: TherapySelectorProps) {
  return (
    <div className="flex-1 flex items-start md:items-center justify-center p-4 md:p-8 min-h-full">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header section with title and description */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-mblack mb-4 font-new-spirit">
            Choose Your Therapy Approach
          </h1>
          <p className="text-grey-medium max-w-2xl mx-auto text-base leading-relaxed">
            Select the therapeutic approach that resonates with you. Each method offers unique tools
            for growth and healing.
          </p>
        </div>

        {/* Therapy cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {THERAPY_TYPES.map((therapy) => (
            <TherapyCard key={therapy.id} therapy={therapy} onSelect={onTherapySelect} />
          ))}
        </div>

        {/* Optional footer note */}
        <div className="text-center">
          <p className="text-sm text-grey-medium">
            Our AI gets better at personalizing your therapy experience with each conversation you
            share. 100% confidential, your data is anonymized.
          </p>
        </div>
      </div>
    </div>
  );
}
