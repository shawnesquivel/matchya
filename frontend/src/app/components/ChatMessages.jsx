"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import styles from "../styles/spinner.module.css";
import Loader from "./Loader";
import useTypingEffect from "./useTypingEffect";

// Helper function to split message content at paragraph breaks
const splitIntoParagraphs = (content) => {
  if (!content) return [];

  // Split on double line breaks which typically indicate paragraph boundaries
  // Filter out empty paragraphs
  return content
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim() !== "");
};

const MessageItem = memo(
  ({ message, isLast, onButtonClick, questionStage }) => {
    // If it's an assistant message, check if we need to split it
    const shouldSplitMessage =
      message.role === "assistant" && !message.isTyping;
    const paragraphs = shouldSplitMessage
      ? splitIntoParagraphs(message.content || "")
      : [message.content];

    // State to track which paragraphs are visible
    const [visibleParagraphs, setVisibleParagraphs] = useState([]);

    // Add staggered animation effect
    useEffect(() => {
      if (!shouldSplitMessage) {
        setVisibleParagraphs([0]); // Show the single paragraph immediately
        return;
      }

      // Reset visible paragraphs when message changes
      setVisibleParagraphs([]);

      // Reveal paragraphs one by one with a delay
      paragraphs.forEach((_, index) => {
        setTimeout(() => {
          setVisibleParagraphs((prev) => [...prev, index]);
        }, index * 350); // 350ms delay between each paragraph
      });
    }, [message.content, paragraphs.length, shouldSplitMessage]);

    const typedText = useTypingEffect(
      message.content || "",
      message.role === "assistant" && message.isTyping
    );

    // If message is empty and not typing, return null
    if (!message.content && !message.isTyping) return null;

    // Special case for typing messages with no content yet
    if (message.isTyping && !message.content) {
      return (
        <div className="flex flex-col mb-2">
          <div className="rounded flex gap-2 align-center relative overflow-hidden h-fit">
            <Image
              src={`/assets/images/matchya.png`}
              alt={`assistant's profile`}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full assistant"
              priority
              unoptimized
            />
            <p className="mt-1.5 text-sm">matchya</p>
          </div>
          <div className="bg-beige-extralight message p-3 h-fit max-w-full rounded-md text-sm w-fit assistant mt-1">
            <Loader />
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col mb-2 ${isLast ? "flex-grow" : ""}`}>
        {shouldSplitMessage ? (
          // Render multiple message bubbles for the assistant
          paragraphs.map((paragraph, index) => (
            <div
              key={index}
              className={`mb-2 last:mb-0 transition-opacity duration-200 ease-in-out ${
                visibleParagraphs.includes(index) ? "opacity-100" : "opacity-0"
              }`}
            >
              {index === 0 && (
                <div className="rounded flex gap-2 align-center relative overflow-hidden h-fit">
                  <Image
                    src={`/assets/images/matchya.png`}
                    alt={`${message.role}'s profile`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full assistant"
                    priority
                    unoptimized
                  />
                  <p className="mt-1.5 text-sm">matchya</p>
                </div>
              )}
              <div className="bg-beige-extralight flex gap-4 flex-col message p-3 h-fit max-w-full rounded-md text-sm w-fit assistant mt-1">
                <div className="flex justify-start align-middle gap-4 w-full h-fit">
                  <p className="sm:mt-[2px] mt-[unset] max-w-full h-fit assistant">
                    <div className="assistant">
                      <ReactMarkdown>{paragraph}</ReactMarkdown>
                    </div>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Regular single bubble for user messages or typing assistant messages
          <div
            className={`bg-beige-extralight flex gap-4 flex-col message p-3 h-fit max-w-full rounded-md text-sm w-fit ${
              message.role === "user" ? "user" : "assistant"
            }`}
          >
            {message.role === "assistant" && (
              <div className="rounded flex gap-2 align-center relative overflow-hidden h-fit">
                <Image
                  src={`/assets/images/matchya.png`}
                  alt={`${message.role}'s profile`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full assistant"
                  priority
                  unoptimized
                />
                <p className="mt-1.5 text-sm">matchya</p>
              </div>
            )}

            <div className="flex justify-start align-middle gap-4 w-full h-fit">
              <p
                className={`sm:mt-[2px] mt-[unset] max-w-full h-fit ${
                  message.role === "user" ? "user" : "assistant"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="assistant">
                    <ReactMarkdown>{typedText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="assistant">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </p>
            </div>
          </div>
        )}
        {message.type === "questionnaire" &&
          message.buttons &&
          questionStage === message.questionIndex && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {message.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log(
                      "button clicked",
                      button.content,
                      button.questionIndex
                    );
                    onButtonClick(
                      button.value,
                      button.content,
                      button.questionIndex
                    );
                  }}
                  className="flex flex-col items-start p-4 bg-white rounded-xl hover:bg-[#F8F8F2] transition-colors shadow-sm border border-gray-200 w-full"
                >
                  <div className="w-8 h-8 mb-4">
                    {button.icon ? (
                      <Image
                        src={`/assets/images/${button.icon}.png`}
                        alt={button.icon}
                        width={32}
                        height={32}
                        className="text-orange-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-gray-300">
                        {button.content.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm sm:text-base md:text-lg font-normal text-left">
                    {button.content}
                  </span>
                </button>
              ))}
            </div>
          )}
      </div>
    );
  }
);

const ChatMessages = ({
  messages,
  isLoadingMessages,
  loadingNewMsg,
  onButtonClick,
  questionStage,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow pl-4 pr-2 content-end overflow-y-scroll">
      {/* Show loading spinner only when isLoadingMessages is true */}
      {isLoadingMessages && (
        <div className="flex justify-center items-center h-full">
          <div className={styles.spinner}></div> {/* Use the spinner here */}
        </div>
      )}
      {/* Display messages if isLoadingMessages is false, regardless of messages count */}
      {!isLoadingMessages &&
        messages
          .filter(
            (message) =>
              (message.content && message.content.trim() !== "") ||
              message.isTyping
          ) // Include typing messages
          .map((message, index) => {
            return (
              <MessageItem
                key={message.id || index}
                message={message}
                onButtonClick={onButtonClick}
                questionStage={questionStage}
              />
            );
          })}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default ChatMessages;
