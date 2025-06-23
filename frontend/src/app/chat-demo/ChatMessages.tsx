import React from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

// TypeScript interfaces
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean; // Flag to indicate a message is currently streaming
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start ${
            message.role === "user" ? "justify-end" : "justify-start"
          } mb-4`}
        >
          {/* Show avatar for assistant messages */}
          {message.role === "assistant" && (
            <Image
              src="/assets/images/matchya.png"
              alt="assistant's profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full mr-3 assistant"
              priority
              unoptimized
            />
          )}

          <div
            className={`rounded-3xl p-3 max-w-full ${
              message.role === "user"
                ? "bg-white text-mblack border border-grey-light"
                : "bg-beige-extralight text-gray-700 border border-grey-light"
            }`}
          >
            {message.role === "user" ? (
              // Render user messages as plain text
              <p className="text-sm">{message.content}</p>
            ) : (
              // Render assistant messages with markdown
              <div className="text-sm markdown-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {/* Show blinking cursor for streaming messages */}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-gray-600 ml-0.5 animate-pulse"></span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing indicator - only show when loading and no streaming message is present */}
      {isLoading && !messages.some((m) => m.isStreaming) && (
        <div className="flex items-start">
          <Image
            src="/assets/images/matchya.png"
            alt="assistant's profile"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full assistant"
            priority
            unoptimized
          />
          <div className="bg-beige-extralight rounded-3xl p-3 border border-grey-light">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
