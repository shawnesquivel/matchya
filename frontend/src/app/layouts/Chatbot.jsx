import React from "react";
import useChatbot from "../hooks/useChatbot";
import useChatSession from "../hooks/useChatSession";
import Title from "../components/Title";
import PageHeader from "../components/PageHeader";
import ChatInput from "../components/ChatInput";
import ChatMessages from "../components/ChatMessages";
import TwoColumnLayout from "../components/TwoColumnLayout";
import NewChatButton from "./NewChatButton";
import ChatbotSettings from "./ChatbotSettings";

const Chatbot = ({
  emoji = "🤖",
  headingText = "Chatbot",
  heading = "Chat",
  boldText = "Powered by OpenAI",
  description = "Fully customizable",
  baseUrl = "http://127.0.0.1:8000",
  botPngFile = "kitsune-girlfriend",
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
    handlePromptChange,
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

  return (
    <>
      <Title emoji={emoji} headingText={headingText} />
      <TwoColumnLayout
        leftColumn={
          <>
            <PageHeader
              heading={heading}
              boldText={boldText}
              description={description}
            />
            <ChatbotSettings
              promptTemplate={promptTemplate}
              setPromptTemplate={setPromptTemplate}
              model={model}
              setModel={setModel}
              temperature={temperature}
              setTemperature={setTemperature}
            />
          </>
        }
        rightColumn={
          <>
            <NewChatButton handleClearChat={newChat} />
            <ChatMessages
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              botPngFile={botPngFile}
            />
            <ChatInput
              prompt={userMessage}
              handlePromptChange={handlePromptChange}
              handleSubmit={handleSubmit}
              placeHolderText={`Type your message...`}
              error={error}
            />
          </>
        }
      />
    </>
  );
};

export default Chatbot;
