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
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isSendingChat ? "Processing..." : "Ask about indie hackers..."}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSendingChat}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSendingChat}
          className={`px-4 py-2 rounded-md ${
            !input.trim() || isSendingChat
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
