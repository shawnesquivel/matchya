'use client';
import React, { useCallback, memo, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/spinner.module.css';
import Loader from './Loader';
import useTypingEffect from './useTypingEffect';

const MessageItem = memo(
  ({ message, botPngFile, isLast, onButtonClick, questionStage, onOpenModal }) => {
    const assistantImage = `/assets/images/${botPngFile}.png`;

    /* PHASE 2: Play the audio if it's present */
    const playAudio = useCallback((audioUrl) => {
      const audio = new Audio(audioUrl);
      audio.play().catch((e) => console.error('Playback failed:', e));
    }, []);
    const matches = message?.sourceDocuments?.matches;

    const typedText = useTypingEffect(
      message.content || '',
      message.role === 'assistant' && message.isTyping
    );

    if (!message.content) return null; // Don't render empty messages

    return (
      <div className={`flex flex-col mb-2 ${isLast ? 'flex-grow' : ''}`}>
        <div
          className={`bg-beige-extralight flex gap-4 flex-col message p-3 h-fit max-w-full rounded-md text-sm w-fit ${
            message.role === 'user' ? 'user' : 'assistant'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="rounded flex gap-2 align-center relative overflow-hidden h-fit">
              <Image
                src={assistantImage}
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
                message.role === 'user' ? 'user' : 'assistant'
              }`}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown>{typedText}</ReactMarkdown>
              ) : (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
            </p>
            {/* PHASE 2: Show the audio if it's present */}
            {message.audio_file_url && (
              <button
                onClick={() => {
                  playAudio(message.audio_file_url);
                }}
                className="items-center rounded-full text-blue-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-8 w-8 text-center"
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

                  if (metadata?.booking_link.startsWith('http')) {
                    bookingLink = metadata.booking_link;
                  } else {
                    bookingLink = null;
                  }

                  // turn the above code into a function
                  // create two variables validatedBookingLink and validatedBioLink
                  // use them in the JSX

                  const validateLink = (link) => {
                    if (link.startsWith('http')) {
                      return link;
                    } else {
                      return null;
                    }
                  };
                  const validatedBookingLink = validateLink(metadata?.booking_link);
                  const validatedBioLink = validateLink(metadata?.bio_link);

                  const joinWithPlus = (name) => {
                    const splitName = name.split(' '); // [firstname, lastname ]
                    if (splitName.length === 2) {
                      return splitName.join('+');
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
                        <div id="top-left" className="flex flex-row gap-4 align-center break-words">
                          <div className="relative h-20 aspect-square">
                            <img
                              src={
                                metadata?.profile_link &&
                                metadata.profile_link.startsWith('http') &&
                                metadata.profile_link !== 'None'
                                  ? metadata.profile_link
                                  : '/assets/images/default-pp.png'
                              }
                              alt={`profile pic ${metadata.name}`}
                              className="aspect-square absolute inset-0 w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div id="top-right" className="flex flex-col gap-1 my-auto">
                            <p className="md:text-m text-sm">{metadata?.location}</p>
                            <p className="md:text-3xl text-xl">{metadata?.name}</p>
                          </div>
                        </div>
                        <p className="lg:text-lg text-md leading-tight">
                          {metadata?.summary.slice(0, 150)}...
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
                        {/* {validatedBookingLink ? (
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
                        )} */}
                        {/* {validatedBioLink ? (
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
                        )}*/}
                        <button
                          onClick={() => {
                            onOpenModal(validatedBioLink);
                          }}
                          className="wfull bg-mblack text-white px-4 py-3 rounded-full flex align-middle justify-center"
                        >
                          View profile
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {message.type === 'questionnaire' &&
          message.buttons &&
          questionStage === message.questionIndex && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {message.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log('button clicked', button.content, button.questionIndex);
                    onButtonClick(button.value, button.content, button.questionIndex);
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
                          // If image fails to load, replace with an empty div
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      // Render an empty placeholder if no icon is specified
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
  botPngFile,
  maxMsgs,
  isLoadingMessages,
  loadingNewMsg,
  onButtonClick,
  questionStage,
  onOpenModal,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          .filter((message) => message.content && message.content.trim() !== '') // Filter out empty messages
          .map((message, index) => {
            return (
              <MessageItem
                // Ensuring unique key
                key={index}
                message={message}
                botPngFile={botPngFile}
                onButtonClick={onButtonClick}
                questionStage={questionStage}
                onOpenModal={onOpenModal}
              />
            );
          })}
      {loadingNewMsg && <Loader />}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default ChatMessages;
