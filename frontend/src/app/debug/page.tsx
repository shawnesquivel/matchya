"use client";

import { useState, useEffect } from "react";
import { clearDirectoryCache } from "@/app/utils/directoryHelpers";

export default function DebugPage() {
  const [environment, setEnvironment] = useState<string>("");
  const [mockFlag, setMockFlag] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get environment info
    setEnvironment(process.env.NODE_ENV || "unknown");

    // Get mock data flag from localStorage
    if (typeof window !== "undefined") {
      setMockFlag(localStorage.getItem("useMockData"));
    }
  }, []);

  const handleClearCache = () => {
    try {
      clearDirectoryCache();
      setMessage("Cache cleared successfully!");
    } catch (err) {
      setMessage(`Error clearing cache: ${err}`);
    }
  };

  const handleToggleMockData = () => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("useMockData") === "true") {
        localStorage.removeItem("useMockData");
        setMockFlag(null);
        setMessage("Mock data disabled. Real API data will be used.");
      } else {
        localStorage.setItem("useMockData", "true");
        setMockFlag("true");
        setMessage("Mock data enabled. Refresh to see mock data.");
      }
    }
  };

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">NODE_ENV:</span> {environment}
          </p>
          <p>
            <span className="font-medium">Mock Data Flag:</span>{" "}
            {mockFlag === null ? "null (disabled)" : mockFlag}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <button
            onClick={handleClearCache}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-3"
          >
            Clear API Cache
          </button>

          <button
            onClick={handleToggleMockData}
            className={`${
              mockFlag === "true"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-4 py-2 rounded mr-3`}
          >
            {mockFlag === "true" ? "Disable Mock Data" : "Enable Mock Data"}
          </button>

          <button
            onClick={handleReload}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mt-4">
            {message}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <ul className="space-y-2 list-disc pl-6">
          <li>
            <a href="/therapists/browse/ca" className="text-blue-600 hover:underline">
              Canada Therapists
            </a>
          </li>
          <li>
            <a href="/therapists/browse/ca/on" className="text-blue-600 hover:underline">
              Ontario Therapists
            </a>
          </li>
          <li>
            <a href="/therapists/browse/ca/bc" className="text-blue-600 hover:underline">
              British Columbia Therapists
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
