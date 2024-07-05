"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import styles from "../styles/spinner.module.css";
import Loader from "./Loader";
// Memo: Do not re-render the component if props havent changed between re-renders
const MessageItem = memo(({ message, botPngFile, isLast }) => {
  /**
   * Render the chat message for user/bots, showing a profile picture.
   * Optionally, it can play audio clips or show source documents.
   *
   * Props:
   * - message: An object representing the chat message, which includes:
   *   - type: 'user' or 'bot'.
   *   - message: Message in text format
   *   - audio_file_url: (optional) A string URL to an audio file that can be played.
   *   - sourceDocuments: (optional) An array of document objects related to the message, each containing:
   *     - pageContent: The text content of the document.
   *     - metadata: An object containing metadata about the document.
   *
   * - botPngFile: A string specifying the filename of the bot's image to use from the `/assets/images` directory.
   *
   * - isLast: A boolean indicating if this is the last message in the chat sequence, which can affect styling.
   *
   * Example:
   * <MessageItem
   *   message={{
   *     type: "bot",
   *     message: "Hi, I'm your friendly assistant.",
   *     audio_file_url: "https://example.com/audio.mp3",
   *     sourceDocuments: [{
   *       pageContent: "Four score and seven years ago...",
   *       metadata: { created: "1863-11-19" }
   *     }]
   *   }}
   *   botPngFile="girlfriend"
   *   isLast={true}
   * />
   */

  /** PHASE 1: Define the URLs for the profile picture for the user and bot */
  const userImage = "/assets/images/green-square.png";
  const botImage = `/assets/images/${botPngFile}.png`;
  const [showSources, setShowSources] = useState(false);

  /* PHASE 2: Play the audio if it's present */
  const playAudio = useCallback((audioUrl) => {
    /** Play an audio object from a given URL. Created on first render only. */
    const audio = new Audio(audioUrl);
    audio.play().catch((e) => console.error("Playback failed:", e));
    // console.log({ audioUrl });
  }, []);
  console.log("source docs", message.sourceDocuments);
  console.log("source docs", typeof message.sourceDocuments);

  const matches = message?.sourceDocuments?.matches;

  return (
    <div className={`flex flex-col ${isLast ? "flex-grow" : ""}`}>
      <div className="flex mb-4 w-full">
        <div className="rounded mr-4 h-10 w-10 relative overflow-hidden">
          {/* PHASE 1: How we choose between the user and bot image. */}
          <Image
            src={message.role === "user" ? userImage : botImage}
            alt={`${message.role}'s profile`}
            width={32}
            height={32}
            className="rounded"
            priority
            unoptimized
          />
        </div>
        {/* PHASE 1: How we get the messages parameter. */}
        <div className="flex justify-start align-middle gap-4 w-full">
          <p
            className={` max-w-full ${
              message.role === "user" ? "user" : "bot"
            }`}
          >
            {message.content ? message.content : "No message found."}
          </p>
          {/* PHASE 2: Show the audio if it's present */}
          {message.audio_file_url && (
            // Repositioned the play button to be inline with the message, making it a part of the message flow
            <button
              onClick={() => {
                console.log("Playing audio");
                playAudio(message.audio_file_url);
              }}
              className="items-center rounded-full bg-gray-200 text-blue-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-8 w-8 text-center"
              aria-label="Play Audio"
            >
              🔊
            </button>
          )}
        </div>
      </div>
      {/* MIMIR: Show source documents */}
      {message.sourceDocuments && (
        <div className="mb-6">
          <button
            className="text-gray-600 text-sm font-bold"
            onClick={() => setShowSources(!showSources)}
          >
            Function Call Results {showSources ? "(Hide)" : "(Show)"}
          </button>
          {showSources && (
            <p className="text-gray-800 text-sm mt-2">
              {JSON.stringify(message.sourceDocuments)}
            </p>
          )}
          <div className="flex flex-row justify-between">
            {matches &&
              matches.map((match) => {
                const id = match.id;
                const metadata = match.metadata;
                return (
                  <div id="card" className="bg-green-200 p-4 flex flex-col">
                    <div id="top-left" className="flex flex-row gap-4">
                      <img
                        src="https://thrivedowntown.com/wp-content/uploads/2024/04/Andressa-Taverna-Counsellor.webp"
                        alt={`profile pic ${metadata.name}`}
                        className="w-16 h-16 rounded-md"
                      />
                      <div id="top-right">
                        <p>{metadata?.location}</p>
                        <p>{metadata?.name}</p>
                      </div>
                    </div>
                    <p>{metadata?.summary.slice(0, 50)}</p>
                    <p>{metadata?.bio.slice(0, 50)}</p>
                    {metadata.specialties.map((el) => (
                      <p>{el}</p>
                    ))}
                    <p>{metadata?.bio.slice(0, 50)}</p>
                    <p>{metadata?.bio.slice(0, 50)}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
});

const ChatMessages = ({
  messages,
  botPngFile,
  maxMsgs,
  isLoadingMessages,
  loadingNewMsg,
}) => {
  /**
   * 
   * The useRef hook in React is used to access a DOM element directly and persist values across renders without triggering a re-render of the component.

      In your ChatMessages component, useRef is used to create a ref object (messagesContainerRef) that is attached to the chat messages container DOM element. This allows your code to directly manipulate the DOM element.

      The useEffect hook in your code is used to scroll the container to the bottom every time the messages array changes, ensuring the latest message is visible. Here's how it works:

      1. A new message is added to the messages array, the component re-renders.
      2. The useEffect hook runs because its dependency array includes [messages].
      3. The useEffect hook accesses messagesContainerRef.current, which is the container div.
      4. It sets the `scrollTop` to the `scrollHeight` of the container -> scrolls to the bottom.
      
      There is no other way to directly manipulate the DOM for scrolling purposes in React's declarative paradigm. 
      The ref persists throughout the life of the component, allowing direct access to the DOM node without causing additional renders, which would happen if you were to use state for this purpose.
    */
  const messagesContainerRef = useRef();

  useEffect(() => {
    // On new message, scroll to the bottom.
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  // E.g. If we have less than {5} messages, the messages won'ts take up the full container.
  //      We add the justify-end property to pushes messages to the bottom
  const maxMsgToScroll = maxMsgs || 5;
  return (
    <div
      ref={messagesContainerRef}
      className={`bg-white p-10 rounded-3xl shadow-lg mb-8 overflow-y-auto h-[500px] max-h-[500px] flex flex-col space-y-4 ${
        messages.length < maxMsgToScroll && "justify-end"
      }`}
    >
      {/* Show loading spinner only when isLoadingMessages is true */}
      {isLoadingMessages && (
        <div className="flex justify-center items-center h-full">
          <div className={styles.spinner}></div> {/* Use the spinner here */}
        </div>
      )}
      {/* Display messages if isLoadingMessages is false, regardless of messages count */}
      {!isLoadingMessages &&
        messages.map((message, index) => {
          // DEBUG: See every individual message
          // console.log({ message });
          return (
            <MessageItem
              // Ensuring unique key
              key={index}
              message={message}
              botPngFile={botPngFile}
            />
          );
        })}
      {loadingNewMsg && <Loader />}
    </div>
  );
};
export default ChatMessages;
