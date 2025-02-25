"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import ChatMessages from "./ChatMessages";

export default function ChatPanel() {
  const { messages, handleChatSubmission, isSendingChat, error } =
    useTherapist();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await handleChatSubmission(input);
    setInput("");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle example query click
  const handleExampleClick = (text) => {
    setInput(text);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat with a Therapist Finder</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        <ChatMessages
          messages={messages}
          botPngFile="girlfriend"
          isLoadingMessages={false}
          loadingNewMsg={isSendingChat}
          onButtonClick={() => {}}
          questionStage={6}
          maxMsgs={20}
          onOpenModal={() => {}}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form
          className="flex items-center space-x-2 gap-2"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className="flex-grow p-2 border rounded-md"
            placeholder="Send a message"
            value={input}
            onChange={handleInputChange}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isSendingChat}
          >
            Send
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            <p
              onClick={() =>
                handleExampleClick(
                  "Looking for a female therapist with experience in asian backgrounds."
                )
              }
              className="text-sm cursor-pointer border p-2 rounded-md hover:bg-gray-100"
            >
              "Looking for a female therapist with experience in asian
              backgrounds."
            </p>
            <p
              onClick={() =>
                handleExampleClick(
                  "Looking for a female therapist with experience in black backgrounds."
                )
              }
              className="text-sm cursor-pointer border p-2 rounded-md hover:bg-gray-100"
            >
              "Looking for a female therapist with experience in black
              backgrounds."
            </p>
            <p
              onClick={() =>
                handleExampleClick(
                  "Looking for a female therapist that can speak thai."
                )
              }
              className="text-sm cursor-pointer border p-2 rounded-md hover:bg-gray-100"
            >
              "Looking for a female therapist that can speak thai."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
