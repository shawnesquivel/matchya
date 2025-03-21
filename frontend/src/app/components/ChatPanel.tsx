"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import ChatMessages from "./ChatMessages";
import ArrowIcon from "./ArrowIcon";

export default function ChatPanel() {
  const {
    messages,
    updateTherapists,
    isSendingChat,
    isTherapistLoading,
    isLoadingFollowUps,
    error,
    isLoadingHistory,
    resetChat,
    followUpQuestions,
    sendFollowUpQuestion,
    chatId,
  } = useTherapist();

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const isLoading = isSendingChat || isTherapistLoading || isLoadingFollowUps;

  const handleSubmit = async (e) => {
    /** Reset input and send message */
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    const textarea = e.target.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "40px";
      setIsExpanded(false);
    }
    await updateTherapists({
      type: "CHAT",
      message,
      preserveLocation: true,
    });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, followUpQuestions]);

  const handleResetChat = () => {
    resetChat();
    setInput("");
  };

  const handleFollowUpClick = (questionText, questionId) => {
    sendFollowUpQuestion(questionText, questionId);
  };

  return (
    <div className="flex-grow flex flex-col h-full sm:p-4 bg-beige overflow-hidden sm:border sm:border-grey-dark">
      <div className="bg-white md:rounded-lg w-full h-full flex flex-col md:border md:border-grey-dark pt-1">
        {/* Header with reset button */}
        <div className=" hidden md:flex justify-end items-center p-3 border-b border-grey-light">
          <button
            onClick={handleResetChat}
            className="text-sm text-grey-medium hover:text-grey-dark px-3 py-1 rounded-md border border-grey-light hover:bg-beige-extralight transition-colors"
            title="Start a new conversation"
            disabled={isLoading}
          >
            New Chat
          </button>
        </div>

        <ChatMessages
          messages={messages}
          isLoadingMessages={isLoadingHistory}
          loadingNewMsg={isSendingChat}
          onButtonClick={() => {}}
          questionStage={6}
          followUpQuestions={followUpQuestions}
          isLoadingFollowUps={isLoadingFollowUps}
          onFollowUpClick={handleFollowUpClick}
          chatId={chatId}
        />
        <div ref={messagesEndRef} />

        <div className="sm:p-4 p-2">
          <form className="flex items-center gap-1" onSubmit={handleSubmit}>
            <textarea
              className={`flex-grow p-2 border text-sm min-h-[40px] max-h-[200px] overflow-y-auto resize-none focus:outline-none focus:ring-1 focus:ring-beige-dark ${
                isExpanded ? "rounded-md" : "rounded-full"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              placeholder={
                isLoading
                  ? "Loading..."
                  : "The more you share, the better the match"
              }
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = "auto";
                const newHeight = Math.min(e.target.scrollHeight, 200);
                e.target.style.height = newHeight + "px";
                setIsExpanded(newHeight > 40);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`mt-auto w-10 h-10 rounded-full text-grey-medium flex items-center justify-center ${
                isLoading || !input.trim()
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-blue-light hover:bg-blue-dark transition-colors"
              }`}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              title="Send"
            >
              <ArrowIcon className="text-grey-medium transform" />
              <span className="sr-only">Send</span>
            </button>
          </form>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* Optional loading indicator */}
          {isLoading && (
            <p className="text-xs text-gray-500 mt-1">
              {isSendingChat
                ? "Processing your question..."
                : isTherapistLoading
                ? "Finding therapists..."
                : isLoadingFollowUps
                ? "Creating follow-up questions..."
                : "Loading..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
