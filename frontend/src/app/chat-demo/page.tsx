"use client";
import React, { useState } from "react";
import LotusPanel from "./LotusPanel";
import TherapySelector from "./TherapySelector";
import Dashboard from "./Dashboard";
import ConversationPanel from "./ConversationPanel";
import { useLotus, LotusProvider } from "./LotusContext";
import "./styles/markdown.css";
import Image from "next/image";
import VoiceSession from "./voice/VoiceSession";

// Custom scrollbar styles copied from main page.js
const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    scrollbar-color: #DDDBD3 transparent;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #DDDBD3;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #DDDBD9;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: #DDDBD3 transparent;
  }
`;

function ChatDemoContent() {
  const { state, setTherapyType, setVoiceMode } = useLotus();
  const [currentView, setCurrentView] = useState<"chat" | "dashboard">("chat");
  const [isConversationPanelVisible, setIsConversationPanelVisible] = useState(false);

  const handleTherapySelect = (selection: { therapyType: string; voiceMode: boolean }) => {
    setTherapyType(selection.therapyType);
    setVoiceMode(selection.voiceMode);
  };

  const toggleConversationPanel = () => {
    setIsConversationPanelVisible(!isConversationPanelVisible);
  };

  const getHeaderText = () => {
    if (currentView === "dashboard") {
      return "Therapy Dashboard";
    }
    if (!state.therapyType) {
      return "Choose Your Therapy";
    }
    return `${state.therapyType.toUpperCase()} Session`;
  };

  const handleViewDashboard = () => {
    setCurrentView("dashboard");
  };

  const handleBackToChat = () => {
    setCurrentView("chat");
  };

  const handleExitSession = () => {
    // Reset therapy selection to go back to selector
    setTherapyType("");
    setVoiceMode(false);
    setCurrentView("chat");
  };

  // Check if user is in an active therapy session
  const isInActiveSession = state.therapyType && !state.isComplete;

  return (
    <div className="h-screen flex flex-col bg-beige overflow-hidden">
      {/* Global scrollbar styling */}
      <style jsx global>
        {scrollbarStyles}
      </style>
      {/* Simple header */}
      <header className="bg-white shadow-sm py-2 px-2 sm:px-4 border-b border-grey-light flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-6 w-auto flex-shrink-0">
            <Image
              src="/assets/images/matchyalogo.png"
              alt="Matchya Logo"
              width={120}
              height={24}
              priority
              className="object-contain h-full w-auto"
            />
          </div>
          <span className="text-sm text-grey-medium truncate">{getHeaderText()}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {isInActiveSession && (
            <button
              onClick={handleExitSession}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors text-red-600 hover:text-white hover:bg-red-600 border border-red-600"
            >
              Exit Session
            </button>
          )}
          <button
            onClick={toggleConversationPanel}
            className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors ${
              isConversationPanelVisible
                ? "bg-green text-white"
                : "text-green hover:text-white hover:bg-green-dark"
            }`}
          >
            History
          </button>
          <button
            onClick={handleViewDashboard}
            className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors ${
              currentView === "dashboard"
                ? "bg-green text-white"
                : "text-green hover:text-white hover:bg-green-dark"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={handleBackToChat}
            className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full transition-colors ${
              currentView === "chat"
                ? "bg-green text-white"
                : "text-green hover:text-white hover:bg-green-dark"
            }`}
          >
            Chat
          </button>
        </div>
      </header>

      {/* Main content with conversation panel */}
      <main className="flex-1 flex overflow-hidden">
        {/* Conversation Panel (Left Sidebar) */}
        <ConversationPanel
          isVisible={isConversationPanelVisible}
          onToggle={toggleConversationPanel}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentView === "dashboard" ? (
            <Dashboard onBackToChat={handleBackToChat} />
          ) : !state.therapyType ? (
            <TherapySelector onTherapySelect={handleTherapySelect} />
          ) : state.voiceMode ? (
            <VoiceSession />
          ) : (
            <div className="max-w-3xl mx-auto h-full">
              <LotusPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ChatDemoPage() {
  return (
    <LotusProvider>
      <ChatDemoContent />
    </LotusProvider>
  );
}
