"use client";
import React, { useRef, useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useLotus, STAGE_NAMES, STAGE_DESCRIPTIONS } from "./LotusContext";

// Progress indicator component
function ProgressIndicator() {
  const { state, getCurrentStageName, setTherapyType, setVoiceMode } = useLotus();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExitSession = () => {
    // Reset therapy selection to go back to selector
    setTherapyType("");
    setVoiceMode(false);
  };

  const stageDescription = STAGE_DESCRIPTIONS[state.stage as keyof typeof STAGE_DESCRIPTIONS] || "";

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              Stage {state.stage}: {getCurrentStageName()}
            </span>
            <span className="text-xs text-gray-500">
              {isClient ? `Session: ${state.sessionId.split("-")[1]}` : "Session: Loading..."}
            </span>
          </div>
          <p className="text-xs text-gray-600 italic">{stageDescription}</p>
        </div>
        <button
          onClick={handleExitSession}
          className="text-xs px-2 py-1 rounded-full transition-colors text-red-600 hover:text-white hover:bg-red-600 border border-red-600 ml-2"
        >
          Exit Session
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-light h-2 rounded-full transition-all duration-500"
          style={{ width: `${(state.stage / 5) * 100}%` }}
        />
      </div>

      {/* Stage labels */}
      <div className="flex justify-between text-xs text-gray-500">
        {Object.entries(STAGE_NAMES).map(([num, name]) => (
          <span
            key={num}
            className={`${
              parseInt(num) <= state.stage ? "text-blue-600 font-medium" : ""
            } transition-colors`}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// Debug panel component
function DebugPanel() {
  const { state, getCurrentStageName } = useLotus();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-50 border-t px-4 py-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        <span>Debug Info</span>
        <svg
          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 text-xs font-mono bg-white p-2 rounded border">
          <div>
            <strong>Session ID:</strong> {state.sessionId}
          </div>
          <div>
            <strong>Stage:</strong> {state.stage} ({getCurrentStageName()})
          </div>
          <div>
            <strong>Messages:</strong> {state.messages.length}
          </div>
          <div>
            <strong>Complete:</strong> {state.isComplete ? "Yes" : "No"}
          </div>
        </div>
      )}
    </div>
  );
}

// Session complete component
function SessionComplete() {
  const { resetSession, state, setTherapyType } = useLotus();

  const handleChangeTherapy = () => {
    setTherapyType(""); // Clear therapy type to show selector
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Session Complete</h2>
        <p className="text-gray-600 mb-4">
          You've completed your CBT session. Great work exploring your thoughts and feelings!
        </p>

        {/* Session stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Messages exchanged:</span>
            <span className="font-medium">{state.messages.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Stages completed:</span>
            <span className="font-medium">5/5</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Remember to practice the insights and techniques we discussed. Consider keeping a thought
          journal to continue your progress.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetSession}
            className="bg-green text-white px-6 py-3 rounded-full hover:bg-green-dark transition-colors font-medium"
          >
            Start New Session
          </button>
          <button
            onClick={handleChangeTherapy}
            className="bg-beige-light text-mblack px-6 py-3 rounded-full hover:bg-beige-dark transition-colors font-medium border border-grey-light"
          >
            Try Different Therapy
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Lotus Panel component
function LotusContent() {
  const { state, addMessage, updateStage, setComplete } = useLotus();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedWelcomeRef = useRef(false);
  const lastTherapyTypeRef = useRef(state.therapyType);
  const lastSessionIdRef = useRef(state.sessionId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Send initial warmup message if no messages exist (StrictMode-safe)
  useEffect(() => {
    // Check if therapy type or session ID changed and reset if needed
    const therapyTypeChanged = lastTherapyTypeRef.current !== state.therapyType;
    const sessionIdChanged = lastSessionIdRef.current !== state.sessionId;

    if (therapyTypeChanged || sessionIdChanged) {
      hasInitializedWelcomeRef.current = false;
      lastTherapyTypeRef.current = state.therapyType;
      lastSessionIdRef.current = state.sessionId;
    }

    if (
      state.messages.length === 0 &&
      !state.isComplete &&
      state.therapyType &&
      !hasInitializedWelcomeRef.current
    ) {
      hasInitializedWelcomeRef.current = true;

      const therapyName = state.therapyType.toUpperCase();
      addMessage({
        role: "assistant",
        content: `Hello! I'm here to guide you through a brief ${therapyName} session. How are you feeling right now?`,
      });
    }
  }, [state.messages.length, state.isComplete, state.therapyType, state.sessionId]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading || state.isComplete) return;

    // Add user message
    addMessage({
      role: "user",
      content: message,
    });

    setIsLoading(true);

    try {
      // Call chat-lotus edge function with session context
      const response = await fetch("http://127.0.0.1:54321/functions/v1/chat-lotus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
        },
        body: JSON.stringify({
          sessionId: state.sessionId,
          stage: state.stage,
          messages: state.messages,
          userMessage: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle stage transitions with smooth UI feedback
      const wasStageChange = data.newStage && data.newStage !== state.stage;

      // Update stage first if changed
      if (wasStageChange) {
        updateStage(data.newStage);
        console.log(`[Lotus]: Stage transition ${state.stage} → ${data.newStage}`);
      }

      // Add bot message with reasoning for debug
      addMessage({
        role: "assistant",
        content: data.botMessage,
        reasoning: data.reasoning,
      });

      // Handle session completion
      if (data.sessionComplete) {
        setComplete(true);
        console.log("[Lotus]: Session completed successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Provide more helpful error messages
      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage =
            "Unable to connect to the therapy service. Please check your connection and try again.";
        } else if (error.message.includes("500")) {
          errorMessage = "The therapy service is having issues. Please try again in a moment.";
        }
      }

      addMessage({
        role: "assistant",
        content: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convert Lotus messages to ChatMessages format
  const convertedMessages = state.messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    isStreaming: false,
  }));

  if (state.isComplete) {
    return (
      <div className="flex flex-col h-full">
        <ProgressIndicator />
        <SessionComplete />
        <DebugPanel />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ProgressIndicator />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <ChatMessages messages={convertedMessages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={state.isComplete}
      />

      <DebugPanel />
    </div>
  );
}

// Main component (provider now at page level)
export default function LotusPanel() {
  return <LotusContent />;
}
