"use client";
import React from "react";
import { TherapistProvider } from "../contexts/TherapistContext";
import FilterPanel from "../components/FilterPanel";
import ChatPanel from "../components/ChatPanel";
import TherapistResultsPanel from "../components/TherapistResultsPanel";

export default function SupaChatContextPage() {
  return (
    <TherapistProvider>
      <div className="flex w-full h-full p-4 gap-4 overflow-hidden">
        {/* Filters - 25% */}
        <div className="flex-none w-1/4 max-w-[300px]">
          <FilterPanel />
        </div>

        {/* Therapist Results - 50% (center) */}
        <div className="flex-1 min-w-0">
          <TherapistResultsPanel />
        </div>

        {/* Chat - 25% */}
        <div className="flex-none w-1/4 max-w-[300px]">
          <ChatPanel />
        </div>
      </div>
    </TherapistProvider>
  );
}
