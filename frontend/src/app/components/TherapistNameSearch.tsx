"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface TherapistNameSearchProps {
  baseUrl: string;
  initialValue?: string;
}

export default function TherapistNameSearch({
  baseUrl,
  initialValue = "",
}: TherapistNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      router.push(`${baseUrl}?name=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      // If search is empty, navigate to base URL without query
      router.push(baseUrl);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex w-full mx-auto">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search therapists by name..."
            className="w-full px-4 py-4 border border-beige-dark rounded-l-full focus:ring-green-light"
          />
        </div>
        <button
          type="submit"
          className="pl-4 pr-6 py-4 bg-purple text-mblack rounded-r-full hover:bg-purple-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          Search
        </button>
      </div>
    </form>
  );
}
