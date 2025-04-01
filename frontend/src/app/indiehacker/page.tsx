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
      <div className="flex h-screen bg-gray-100">
        <div className="flex flex-col w-full md:w-3/4 h-full overflow-hidden">
          <header className="bg-white p-4 shadow-sm border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-700">Indie Hacker Chatbot</h1>
            <p className="text-sm text-gray-500">Ask questions about founders and their products</p>
          </header>
          <div className="flex-grow flex flex-col overflow-hidden shadow-md bg-white m-4 rounded-lg">
            <IndieHackerChatMessages />
            <IndieHackerStarterPrompts />
            <IndieHackerChatInput />
          </div>
        </div>

        <div className="hidden md:block md:w-1/4 bg-white border-l border-gray-200 overflow-y-auto p-4 shadow-inner">
          <div className="sticky top-0 pt-2 pb-4 bg-white">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Founder Matches</h2>
            <IndieHackerFilters />
          </div>
          <IndieHackerResults />
        </div>
      </div>
    </IndieHackerProvider>
  );
}
