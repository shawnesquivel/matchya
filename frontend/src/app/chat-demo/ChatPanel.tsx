"use client";
import React, { useState, useRef, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

// Updated TypeScript interface for our message structure
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string; // New property for image messages
  isStreaming?: boolean; // Flag to indicate a message is currently streaming
}

export default function ChatPanel() {
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "# Welcome to the Chat Demo!\n\nHow can I help you today? You can ask me questions.\n\n**Features:**\n- Text chat with markdown support\n- Streaming responses\n\n``\nTry asking a question to get started!\n```",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    const newUserMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:54321/functions/v1/chat-lotus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `lotus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: "assistant",
          content: data.message || "No response from edge function.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: "assistant",
          content: "Error contacting chat-lotus edge function.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
