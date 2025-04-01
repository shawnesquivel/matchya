"use client";
import React, { useState, FormEvent } from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

export default function IndieHackerChatInput() {
  const { chatSearch, isSendingChat } = useIndieHacker();
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSendingChat) return;

    chatSearch(input);
    setInput("");
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-3xl mx-auto relative">
        <div className="relative flex-grow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isSendingChat ? "Processing..." : "Find cracked builders..."}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400"
            disabled={isSendingChat}
          />
          {input.length > 0 && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isSendingChat}
          className={`min-w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
            ${
              !input.trim() || isSendingChat
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md hover:scale-105"
            }`}
          aria-label="Send message"
        >
          {isSendingChat ? (
            <div className="h-5 w-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
