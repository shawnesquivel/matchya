"use client";
import React from "react";
import { IndieHackerProvider } from "../contexts/IndieHackerContext";
import IndieHackerChatInput from "../components/IndieHackerChatInput";
import IndieHackerChatMessages from "../components/IndieHackerChatMessages";
import IndieHackerResults from "../components/IndieHackerResults";
import IndieHackerFilters from "../components/IndieHackerFilters";
import IndieHackerStarterPrompts from "../components/IndieHackerStarterPrompts";

export default function IndieHackerPage() {
  return (
    <IndieHackerProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col w-full md:w-3/4 h-full overflow-hidden">
          <header className="bg-white p-5 shadow-sm border-b border-gray-200 bg-gradient-to-r from-white to-blue-50">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Indie Hacker Chatbot
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Ask questions about founders and their products to build your own startup
              </p>
            </div>
          </header>
          <div className="flex-grow flex flex-col overflow-hidden mx-4 my-4">
            <div className="flex-grow flex flex-col overflow-hidden rounded-xl shadow-md bg-white border border-gray-200">
              <IndieHackerChatMessages />
              <IndieHackerStarterPrompts />
              <IndieHackerChatInput />
            </div>
          </div>
        </div>

        <div className="hidden md:block md:w-1/4 overflow-y-auto border-l border-gray-200 bg-white">
          <div className="sticky top-0 pt-5 pb-4 bg-gradient-to-r from-white to-blue-50 border-b border-gray-200">
            <div className="px-4">
              <h2 className="text-lg font-semibold mb-1 text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Founder Matches
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Filter founders by Monthly Recurring Revenue
              </p>
            </div>
            <IndieHackerFilters />
          </div>
          <div className="px-4 py-2">
            <IndieHackerResults />
          </div>
        </div>
      </div>
    </IndieHackerProvider>
  );
}
