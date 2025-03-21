"use client";
import React, { useEffect, useState, useMemo } from "react";
import useChatbot from "../hooks/useChatbot";
import Title from "../components/Title";
import ChatInput from "../components/ChatInput";
import ChatMessages from "../components/ChatMessages";
import TwoColumnLayout from "../components/TwoColumnLayout";
import NewChatButton from "./NewChatButton";
import Footer from "../components/Footer";
import ProfileModal from "../components/ProfileModal";
import TherapistSignUpLink from "../components/Links/TherapistSignUpLink";
import ChatbotQuestionnaireLink from "../components/Links/ChatbotQuestionnaireLink";

const Chatbot = ({ skipQuestionnaire = true }) => {
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
    handleButtonClick,
    questionStage,
    checkHealth,
  } = useChatbot();

  // Force questionnaire completion if skipping
  const effectiveQuestionStage = skipQuestionnaire ? 6 : questionStage;

  useEffect(() => {
    async function checkHealthStatus() {
      const health = await checkHealth();
      console.log("Health check:", health);
    }
    checkHealthStatus();
  }, []);

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
        onButtonClick={handleButtonClick}
        questionStage={effectiveQuestionStage}
        onOpenModal={handleOpenModal}
      />
    ),
    [
      messages,
      isLoadingMessages,
      loadingNewMsg,
      handleButtonClick,
      effectiveQuestionStage,
      handleOpenModal,
    ]
  );

  return (
    <>
      <div className="bg-grey gap-2 flex flex-col px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 h-full pb-14">
        <TwoColumnLayout
          leftColumn={
            <>
              <Title />
            </>
          }
          rightColumn={
            <>
              <NewChatButton handleClearChat={newChat} />
            </>
          }
        />
        <TherapistSignUpLink />
        {/* <ChatbotQuestionnaireLink /> */}
        <>
          <div className="min-w-full bg-white pt-0 pb-2 md:px-6 px-2 rounded-3xl overflow-hidden border-grey-dark border h-full justify-end flex flex-col max-w-[1440px] mx-auto lg:h-[85vh] md:h-[84vh] sm:h-[85vh] w-full">
            {memoizedChatMessages}
            {effectiveQuestionStage === 6 && (
              <ChatInput
                prompt={userMessage}
                handlePromptChange={handlePromptChange}
                handleSubmit={
                  skipQuestionnaire
                    ? () =>
                        handleSubmit({
                          gender: "female",
                          specialty: "anxiety",
                          language: "English",
                        })
                    : handleSubmit
                }
                placeHolderText={`I'm looking for a therapist that specializes in anxiety, with experience navigating Asian family dynamics.`}
                error={error}
              />
            )}
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
