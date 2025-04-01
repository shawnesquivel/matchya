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
          <header className="bg-white p-4 shadow-sm">
            <h1 className="text-xl font-bold">Indie Hacker Chatbot</h1>
          </header>
          <div className="flex-grow flex flex-col overflow-hidden">
            <IndieHackerChatMessages />
            <IndieHackerStarterPrompts />
            <IndieHackerChatInput />
          </div>
        </div>

        <div className="hidden md:block md:w-1/4 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <IndieHackerFilters />
          <IndieHackerResults />
        </div>
      </div>
    </IndieHackerProvider>
  );
}
