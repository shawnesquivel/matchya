"use client";
import React, { useRef, useEffect } from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="animate-pulse w-2 h-2 bg-blue-300 rounded-full"></div>
    <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full animation-delay-200"></div>
    <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full animation-delay-400"></div>
  </div>
);

const BotAvatar = () => (
  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs shadow-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8"></path>
      <rect x="2" y="8" width="20" height="12" rx="2"></rect>
      <path d="M6 16h.01"></path>
      <path d="M10 16h.01"></path>
      <path d="M14 16h.01"></path>
      <path d="M18 16h.01"></path>
    </svg>
  </div>
);

const UserAvatar = () => (
  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  </div>
);

export default function IndieHackerChatMessages() {
  const { messages } = useIndieHacker();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow p-5 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
      <div className="space-y-6 max-w-3xl mx-auto">
        {messages.map((message: any, index: number) => (
          <div
            key={message.id || index}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && <BotAvatar />}

            <div
              className={`relative max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-800 shadow-sm"
              }`}
            >
              {message.isTyping ? (
                <LoadingDots />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}

              {/* Message tip/arrow */}
              <div
                className={`absolute top-4 w-2 h-2 transform rotate-45 ${
                  message.role === "user"
                    ? "right-0 translate-x-1/2 bg-blue-600"
                    : "left-0 -translate-x-1/2 bg-white border-l border-t border-gray-200"
                }`}
              ></div>
            </div>

            {message.role === "user" && <UserAvatar />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
