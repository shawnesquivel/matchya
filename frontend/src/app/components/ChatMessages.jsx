"use client";
import React, { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import styles from "../styles/spinner.module.css";
import Loader from "./Loader";
import useTypingEffect from "./useTypingEffect";

const splitIntoParagraphs = (content) => {
  if (!content) return [];
  return content
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim() !== "");
};

const FollowUpQuestions = ({ questions, onQuestionClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <div
            className={styles.spinner}
            style={{ width: "16px", height: "16px" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 mb-4">
      <p className="text-sm text-gray-500 mb-1">People also ask</p>
      <div className="flex flex-col gap-2">
        {questions.map((question) => (
          <button
            key={question.id}
            onClick={() => onQuestionClick(question.text, question.id)}
            className="text-left px-3 py-2 bg-white hover:bg-beige-extralight text-gray-700 text-sm rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center"
          >
            <div className="flex-grow">{question.text}</div>
            <div className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const MessageItem = memo(
  ({
    message,
    isLast,
    onButtonClick,
    questionStage,
    followUpQuestions,
    onFollowUpClick,
    isLoadingFollowUps,
  }) => {
    // If it's an assistant message, check if we need to split it
    const shouldSplitMessage =
      message.role === "assistant" && !message.isTyping;
    const shouldAnimate = shouldSplitMessage && isLast; // Only animate if it's the last message
    const paragraphs = shouldSplitMessage
      ? splitIntoParagraphs(message.content || "")
      : [message.content];

    // State to track which paragraphs are visible
    const [visibleParagraphs, setVisibleParagraphs] = useState([]);

    // Add staggered animation effect only for the last message
    useEffect(() => {
      if (!shouldAnimate) {
        setVisibleParagraphs(paragraphs.map((_, i) => i)); // Show all paragraphs immediately
        return;
      }

      // Reset visible paragraphs when message changes
      setVisibleParagraphs([]);

      // Reveal paragraphs one by one with a delay only for the last message
      paragraphs.forEach((_, index) => {
        setTimeout(() => {
          setVisibleParagraphs((prev) => [...prev, index]);
        }, index * 1000);
      });
    }, [message.content, paragraphs.length, shouldAnimate]);

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

    // For non-last assistant messages, show content immediately
    if (message.role === "assistant" && !isLast && !message.isTyping) {
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
            <div className="flex justify-start align-middle gap-4 w-full h-fit">
              <p className="sm:mt-[2px] mt-[unset] max-w-full h-fit assistant">
                <div className="assistant">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col mb-2 ${isLast ? "flex-grow" : ""}`}>
        {shouldSplitMessage ? (
          // Render multiple message bubbles for the assistant
          <>
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className={`mb-2 last:mb-0 transition-opacity duration-200 ease-in-out ${
                  visibleParagraphs.includes(index)
                    ? "opacity-100"
                    : "opacity-0"
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
            ))}

            {/* Show follow-up questions after the last assistant message */}
            {isLast && (
              <FollowUpQuestions
                questions={followUpQuestions}
                onQuestionClick={onFollowUpClick}
                isLoading={isLoadingFollowUps}
              />
            )}
          </>
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
  followUpQuestions,
  isLoadingFollowUps,
  onFollowUpClick,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, followUpQuestions]);

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
          .map((message, index, filteredMessages) => {
            const isLastMessage = index === filteredMessages.length - 1;

            return (
              <MessageItem
                key={message.id || index}
                message={message}
                isLast={isLastMessage}
                onButtonClick={onButtonClick}
                questionStage={questionStage}
                followUpQuestions={
                  isLastMessage &&
                  message.role === "assistant" &&
                  !message.isTyping
                    ? followUpQuestions
                    : []
                }
                onFollowUpClick={onFollowUpClick}
                isLoadingFollowUps={isLoadingFollowUps}
              />
            );
          })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
