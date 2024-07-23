"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import styles from "../styles/spinner.module.css";
import Loader from "./Loader";
import useTypingEffect from "./useTypingEffect";
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
  const matches = message?.sourceDocuments?.matches;

  const typedText = useTypingEffect(message.content || "", message.isTyping);

  if (!message.content) return null; // Don't render empty messages

  return (
    <div className={`flex flex-col mb-2 ${isLast ? "flex-grow" : ""}`}>
      <div
        className={`flex lg:max-w-[80%]  message p-4 h-fit max-w-full rounded-2xl w-fit ${
          message.role === "user" ? "user" : "bot"
        }`}
      >
        <div className="rounded mr-4 h-10 w-10 relative overflow-hidden h-fit">
          {/* PHASE 1: How we choose between the user and bot image. */}
          <Image
            src={message.role === "user" ? userImage : botImage}
            alt={`${message.role}'s profile`}
            width={32}
            height={32}
            className={`w-8 h-8 rounded ${
              message.role === "user" ? "user" : "bot"
            }`}
            priority
            unoptimized
          />
        </div>
        {/* PHASE 1: How we get the messages parameter. */}
        <div className="flex justify-start align-middle gap-4 w-full h-fit">
          <p
            className={`sm:mt-[2px] mt-[unset] max-w-full h-fit ${
              message.role === "user" ? "user" : "bot"
            }`}
          >
            {typedText}
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
        <div className="">
          <div className="mt-3 grid lg:grid-cols-3 gap-4 grid-cols-1">
            {matches &&
              matches.map((match) => {
                const id = match.id;
                const metadata = match.metadata;
                let bookingLink;

                if (metadata?.booking_link.startsWith("http")) {
                  bookingLink = metadata.booking_link;
                } else {
                  bookingLink = null;
                }

                // turn the above code into a function
                // create two variables validatedBookingLink and validatedBioLink
                // use them in the JSX

                const validateLink = (link) => {
                  if (link.startsWith("http")) {
                    return link;
                  } else {
                    return null;
                  }
                };
                const validatedBookingLink = validateLink(
                  metadata?.booking_link
                );
                const validatedBioLink = validateLink(metadata?.bio_link);

                const joinWithPlus = (name) => {
                  const splitName = name.split(" "); // [firstname, lastname ]
                  if (splitName.length === 2) {
                    return splitName.join("+");
                  } else {
                    return name;
                  }
                };

                const queryFormattedName = joinWithPlus(metadata?.name);
                const queryFormattedClinic = joinWithPlus(metadata?.clinic);
                const queryFormattedLocation = joinWithPlus(metadata?.location);

                return (
                  <div
                    id="card"
                    className="transition-all ease-in-out bg-beige-light lg:p-6 flex flex-col wfull rounded-2xl justify-between gap-6 border border-transparent hover:border-grey-dark p-4"
                  >
                    <div className="flex flex-col gap-4">
                      <div
                        id="top-left"
                        className="flex flex-row gap-4 align-center break-words"
                      >
                        <div className="relative h-20 aspect-square">
                          <img
                            src={
                              metadata?.image || "/assets/images/default-pp.png"
                            }
                            alt={`profile pic ${metadata.name}`}
                            className="aspect-square absolute inset-0 w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div
                          id="top-right"
                          className="flex flex-col gap-1 my-auto"
                        >
                          <p className="md:text-m text-sm">
                            {metadata?.location}
                          </p>
                          <p className="md:text-3xl text-xl">
                            {metadata?.name}
                          </p>
                        </div>
                      </div>
                      <p className="lg:text-lg text-md leading-tight">
                        {metadata?.summary.slice(0, 150)}.
                      </p>
                      {/* <p>{metadata?.bio.slice(0, 50)}</p> */}
                      <ul className="flex gap-y-1 gap-x-2 wfull flex-wrap">
                        {metadata.specialties.slice(0, 4).map((el, index) => (
                          <li className="whitespace-nowrap flex px-1 py-1 border border-orange rounded-full text-orange text-xs">
                            {el}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col align-center">
                      {validatedBookingLink ? (
                        <a
                          href={validatedBookingLink}
                          target="_blank"
                          className="wfull bg-mblack text-white px-4 py-3 rounded-full flex align-middle justify-center"
                        >
                          Book Now
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/search?q=${queryFormattedName}+${queryFormattedClinic}+${queryFormattedLocation}`}
                          target="_blank"
                          className="wfull bg-mblack text-white px-4 py-3 rounded-full flex align-middle justify-center"
                        >
                          Find on Google
                        </a>
                      )}
                      {validatedBioLink ? (
                        <a
                          href={validatedBioLink}
                          target="_blank"
                          className="wfull text-mblack px-4 pt-3 rounded-full flex align-middle justify-center"
                        >
                          Read Full Bio
                        </a>
                      ) : (
                        <a
                          href={validatedBioLink}
                          target="_blank"
                          className="wfull text-transparent px-4 pt-3 rounded-full flex align-middle justify-center pointer-events-none"
                        >
                          "
                        </a>
                      )}
                    </div>
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

  return (
    <div className="overflow-y-scroll">
      {/* Show loading spinner only when isLoadingMessages is true */}
      {isLoadingMessages && (
        <div className="flex justify-center items-center h-full">
          <div className={styles.spinner}></div> {/* Use the spinner here */}
        </div>
      )}
      {/* Display messages if isLoadingMessages is false, regardless of messages count */}
      {!isLoadingMessages &&
        messages
          .filter((message) => message.content.trim() !== "") // Filter out empty messages
          .map((message, index) => {
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
