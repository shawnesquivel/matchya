import React, { useEffect } from "react";
import useChatbot from "../hooks/useChatbot";
import useChatSession from "../hooks/useChatSession";
import Title from "../components/Title";
import PageHeader from "../components/PageHeader";
import ChatInput from "../components/ChatInput";
import ChatMessages from "../components/ChatMessages";
import TwoColumnLayout from "../components/TwoColumnLayout";
import NewChatButton from "./NewChatButton";
import ChatbotSettings from "./ChatbotSettings";
import Loader from "../components/Loader";
import Link from "next/link";
import Footer from "../components/Footer";

const Chatbot = ({
  emoji = "🤖",
  headingText = "Chatbot",
  heading = "Chat",
  boldText = "Powered by OpenAI",
  description = "Fully customizable",
  baseUrl = "http://127.0.0.1:8000",
  botPngFile = "girlfriend",
  debug = false,
}) => {
  /**
   *
   *
   */
  const {
    userMessage,
    messages,
    error,
    isLoadingMessages,
    loadingNewMsg,
    handlePromptChange,
    fetchInitialChatMessages,
    handleSubmit,
    promptTemplate,
    setPromptTemplate,
    model,
    setModel,
    temperature,
    setTemperature,
    newChat,
    chatId,
  } = useChatbot(baseUrl, debug);

  useEffect(() => {
    fetchInitialChatMessages();
  }, []);

  return (
    <>
      <div className="bg-grey gap-2 flex flex-col px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 h-full">
        <TwoColumnLayout
          leftColumn={
            <>
              {" "}
              <Title emoji={emoji} headingText={headingText} />
              <Link
                href={"/profile"}
                className="underline underline-offset-2 ml-4 mt-4"
              >
                Are you a therapist? Get listed today.
              </Link>
            </>
          }
          rightColumn={
            <>
              <NewChatButton handleClearChat={newChat} />
            </>
          }
        />

        <>
          <div className="min-w-full bg-white pt-0 pb-6 md:px-6 px-2 rounded-3xl overflow-hidden border-grey-dark border h-full justify-end flex flex-col max-w-[1440px] mx-auto lg:h-[85vh] md:h-[84vh] sm:h-[85vh] h-[70vh] w-full">
            <ChatMessages
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              loadingNewMsg={loadingNewMsg}
              botPngFile={botPngFile}
            />
            <ChatInput
              prompt={userMessage}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmit}
              placeHolderText={`Type your message...`}
              error={error}
            />
          </div>
        </>
      </div>
      <Footer />
    </>
  );
};

export default Chatbot;
