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
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isSendingChat ? "Processing..." : "Ask about indie hackers..."}
          className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700"
          disabled={isSendingChat}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSendingChat}
          className={`p-3 rounded-full min-w-[50px] flex items-center justify-center transition-colors duration-200 ${
            !input.trim() || isSendingChat
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          }`}
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-send"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
