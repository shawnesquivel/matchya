"use client";
import React, { useState, useEffect } from "react";
import LotusPanel from "./LotusPanel";
import TherapySelector from "./TherapySelector";
import Dashboard from "./Dashboard";
import ConversationPanel from "./ConversationPanel";
import { useLotus, LotusProvider } from "./LotusContext";
import "./styles/markdown.css";
import Image from "next/image";
import VoiceSession from "./voice/VoiceSession";
import SafetyAssessment from "../components/SafetyAssessment";
import CrisisResources from "../components/CrisisResources";
import { useUser } from "@clerk/nextjs";

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
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<"chat" | "dashboard">("chat");
  const [isConversationPanelVisible, setIsConversationPanelVisible] = useState(false);
  const [safetyAssessmentStatus, setSafetyAssessmentStatus] = useState<
    "loading" | "needed" | "passed" | "failed"
  >("loading");
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  // Check safety assessment status on mount
  useEffect(() => {
    if (!user) return;

    const checkSafetyAssessment = async () => {
      try {
        const response = await fetch("/api/user-profile");
        if (response.ok) {
          const profile = await response.json();

          console.log("🔍 Safety Assessment Status Check:", {
            has_passed_safety_assessment: profile.has_passed_safety_assessment,
            safety_assessment_completed_at: profile.safety_assessment_completed_at,
            user_id: profile.id,
          });

          // Check if user has actually completed the assessment
          if (!profile.safety_assessment_completed_at) {
            // User hasn't taken the assessment yet
            console.log("✅ User needs to take assessment");
            setSafetyAssessmentStatus("needed");
          } else if (profile.has_passed_safety_assessment === true) {
            // User took assessment and passed
            console.log("✅ User passed assessment");
            setSafetyAssessmentStatus("passed");
          } else {
            // User took assessment and failed
            console.log("❌ User failed assessment");
            setSafetyAssessmentStatus("failed");
          }
        } else {
          setSafetyAssessmentStatus("needed");
        }
      } catch (error) {
        console.error("Error checking safety assessment:", error);
        setSafetyAssessmentStatus("needed");
      }
    };

    checkSafetyAssessment();
  }, [user]);

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

  const handleSafetyAssessmentComplete = (passed: boolean) => {
    console.log("🔍 Safety Assessment Complete:", { passed });
    if (passed) {
      setSafetyAssessmentStatus("passed");
    } else {
      setSafetyAssessmentStatus("failed");
      setShowCrisisResources(true);
    }
  };

  const handleReturnFromCrisis = () => {
    setShowCrisisResources(false);
  };

  const handleRetakeAssessment = () => {
    setSafetyAssessmentStatus("needed");
    setShowCrisisResources(false);
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
          {showCrisisResources ? (
            <CrisisResources
              onReturn={handleReturnFromCrisis}
              onRetakeAssessment={handleRetakeAssessment}
            />
          ) : safetyAssessmentStatus === "loading" ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
                <p className="text-grey">Loading...</p>
              </div>
            </div>
          ) : safetyAssessmentStatus === "needed" ? (
            <SafetyAssessment onComplete={handleSafetyAssessmentComplete} />
          ) : safetyAssessmentStatus === "failed" ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-2xl text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-800 mb-4">
                  Professional Support Recommended
                </h2>
                <p className="text-red-700 mb-6">
                  Based on your responses, we recommend seeking immediate professional support. Our
                  AI therapy chat is not appropriate for crisis situations.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCrisisResources(true)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
                  >
                    View Crisis Resources
                  </button>
                  <div className="text-center">
                    <p className="text-sm text-grey mb-2">
                      If your situation has changed, you may retake the assessment:
                    </p>
                    <button
                      onClick={handleRetakeAssessment}
                      className="text-brand-accent hover:underline text-sm font-medium"
                    >
                      Retake Safety Assessment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === "dashboard" ? (
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
