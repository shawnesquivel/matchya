"use client";
import React, { useEffect, useState, useMemo } from "react";
import useChatbot from "../hooks/useChatbot";
import Title from "../components/Title";
import ChatInput from "../components/ChatInput";
import ChatMessages from "../components/ChatMessages";
import TwoColumnLayout from "../components/TwoColumnLayout";
import NewChatButton from "./NewChatButton";
import Footer from "../components/Footer";
import { aspekta } from "../styles/fonts";
import ProfileModal from "../components/ProfileModal";

const Chatbot = ({
  emoji = "🤖",
  headingText = "Chatbot",
  botPngFile = "girlfriend",
  debug = false,
}) => {
  /**
   *
   *
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const {
    userMessage,
    messages,
    error,
    isLoadingMessages,
    loadingNewMsg,
    handlePromptChange,
    fetchInitialChatMessages,
    handleSubmit,
    newChat,
    chatId,
    handleButtonClick,
    questionStage,
  } = useChatbot(debug);

  useEffect(() => {
    async function initializeChat() {
      try {
        await fetchInitialChatMessages();
      } catch (err) {
        console.error("Failed to fetch initial messages:", err);
      }
    }

    initializeChat();
  }, []);

  const handleOpenModal = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optionally, reset the selectedUserId after a short delay
    setTimeout(() => setSelectedUserId(null), 300);
  };

  const memoizedChatMessages = useMemo(
    () => (
      <ChatMessages
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        loadingNewMsg={loadingNewMsg}
        botPngFile={botPngFile}
        onButtonClick={handleButtonClick}
        questionStage={questionStage}
        onOpenModal={handleOpenModal}
      />
    ),
    [
      messages,
      isLoadingMessages,
      loadingNewMsg,
      botPngFile,
      handleButtonClick,
      questionStage,
      handleOpenModal,
    ]
  );

  return (
    <>
      <div className="bg-grey gap-2 flex flex-col px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 h-full pb-14">
        <TwoColumnLayout
          leftColumn={
            <>
              <Title emoji={emoji} headingText={headingText} />
            </>
          }
          rightColumn={
            <>
              <NewChatButton handleClearChat={newChat} />
            </>
          }
        />
        <a
          href="/profile"
          className="flex items-center gap-2 text-grey-extraDark hover:-translate-x-1 transition-transform"
        >
          <svg
            width="9"
            height="8"
            viewBox="0 0 9 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.646447 3.42281C0.451184 3.61808 0.451184 3.93466 0.646447 4.12992L3.82843 7.3119C4.02369 7.50716 4.34027 7.50716 4.53553 7.3119C4.7308 7.11664 4.7308 6.80006 4.53553 6.60479L1.70711 3.77637L4.53553 0.94794C4.7308 0.752678 4.7308 0.436095 4.53553 0.240833C4.34027 0.0455707 4.02369 0.0455707 3.82843 0.240833L0.646447 3.42281ZM9 3.27637L1 3.27637L1 4.27637L9 4.27637L9 3.27637Z"
              fill="#878787"
            />
          </svg>
          <span>Are you a therapist? Get listed today</span>
        </a>
        <>
          <div className="min-w-full bg-white pt-0 pb-2 md:px-6 px-2 rounded-3xl overflow-hidden border-grey-dark border h-full justify-end flex flex-col max-w-[1440px] mx-auto lg:h-[85vh] md:h-[84vh] sm:h-[85vh] h-[70vh] w-full">
            {memoizedChatMessages}
            {questionStage === 6 && (
              <ChatInput
                prompt={userMessage}
                handlePromptChange={handlePromptChange}
                handleSubmit={handleSubmit}
                placeHolderText={`I'm looking for a female/male therapist that specializes in anxiety, with experience navigating Asian family dynamics.`}
                error={error}
              />
            )}
            <p className={`mt-4 text-xs text-center ${aspekta.className}`}>
              100% confidentiality, we never store your data. Most therapists
              are physically located in British Columbia, Canada.
            </p>
          </div>
        </>
      </div>
      <Footer />
      {isModalOpen && (
        <ProfileModal userId={selectedUserId} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default Chatbot;
