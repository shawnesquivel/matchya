"use client";
import React, { useRef, useEffect } from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

const LoadingDots = () => (
  <div className="flex space-x-1">
    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full delay-0"></div>
    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full delay-150"></div>
    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full delay-300"></div>
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
    <div className="flex-grow p-4 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message: any, index: number) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.isTyping ? (
                <LoadingDots />
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
