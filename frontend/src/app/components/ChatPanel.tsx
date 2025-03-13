"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import ChatMessages from "./ChatMessages";
import ArrowIcon from "./ArrowIcon";

export default function ChatPanel() {
  const { messages, updateTherapists, isSendingChat, error } = useTherapist();

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    /** Reset input and send message */
    e.preventDefault();
    if (!input.trim()) return;
    const message = input;
    setInput("");
    const textarea = e.target.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "40px";
      setIsExpanded(false);
    }
    await updateTherapists({ type: "CHAT", message });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleExampleClick = (text) => {
    setInput(text);
  };

  return (
    <div className="flex-grow flex flex-col h-full p-4 bg-beige overflow-hidden border border-grey-dark">
      <div className=" bg-white rounded-lg w-full h-full flex flex-col border border-grey-dark">
        <ChatMessages
          messages={messages}
          isLoadingMessages={false}
          loadingNewMsg={isSendingChat}
          onButtonClick={() => {}}
          questionStage={6}
        />
        <div ref={messagesEndRef} />

        <div className="p-4">
          <form className="flex items-center  gap-1" onSubmit={handleSubmit}>
            <textarea
              className={`flex-grow p-2 border text-sm min-h-[40px] max-h-[200px] overflow-y-auto resize-none focus:outline-none focus:ring-1 focus:ring-beige-dark ${
                isExpanded ? "rounded-md" : "rounded-full"
              }`}
              placeholder="Describe your preferences or ask questions"
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
              autoFocus
              rows={1}
            />
            <button
              type="submit"
              className="mt-auto bg-blue-light w-10 h-10 rounded-full text-grey-medium hover:bg-blue-dark transition-colors flex items-center justify-center"
              disabled={isSendingChat}
              aria-label="Send message"
              title="Send"
            >
              <ArrowIcon className="text-grey-medium transform" />
              <span className="sr-only">Send</span>
            </button>
          </form>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* Test Queries */}
          {/* <div className="mt-4">
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
          </div> */}
        </div>
      </div>
    </div>
  );
}
