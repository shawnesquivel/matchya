"use client";
import { useState, useEffect } from "react";
import {
  getChatID,
  generateUniqueID,
  generateTimeStamp,
  clearChatIDCookie,
  setCookiesChatId,
} from "../utils/chatHelpers";

const useChatbot = (baseUrl = "http://127.0.0.1:8000", debug = false) => {
  const [chatId, setChatId] = useState(getChatID());
  // ChatMessages
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Chatbot Form
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [promptTemplate, setPromptTemplate] = useState("girlfriend");
  const [temperature, setTemperature] = useState(0.5);

  useEffect(() => {
    /**
     *  When the component is 'mounted' we check if the ChatID is present.
     *  If it's present, we should fetch any messages from the database.
     */
    if (!chatId) {
      const newChatId = generateUniqueID();
      console.log({ newChatId });
      setCookiesChatId(newChatId);
      setChatId(newChatId);
    } else {
      fetchMessages();
    }

    async function fetchMessages() {
      /** Fetches previous messages, or makes a new chat */
      if (chatId && messages.length === 0) {
        //
        await fetchPreviousMessages();
      } else {
        newChat();
      }
    }
  }, [chatId]);

  useEffect(() => {
    /**
     *   Helper function, tests if the server is online..
     */
    async function testLambda() {
      await testEndpoint();
    }
    const testEndpoint = async () => {
      try {
        console.log(`Testing Chalice Deployed: ${baseUrl}`);
        const response = await fetch(baseUrl);

        console.log({ response });

        const resJson = await response.json();

        console.log({ resJson });
      } catch (err) {
        console.log(`error testing the endpoint: ${err}`);
      }
    };

    if (debug) {
      testLambda();
    }
  }, []);

  const handlePromptChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleSubmit = async () => {
    /**
     * Run the chat function
     *
     * 1. Update the `messages` array with the USER's message.
     * 2. Send the USER's message to the backend.
     * 3. Update the `messages` array with the BOT's message.
     */
    try {
      const chatId = getChatID();
      const timestamp = generateTimeStamp();

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: userMessage,
          type: "user",
          sourceDocuments: null,
          timestamp: timestamp,
          ChatId: chatId,
        },
      ]);

      const body = JSON.stringify({
        chat_id: chatId,
        timestamp: timestamp,
        message: userMessage,
        model: model,
        prompt_template: promptTemplate,
        temperature: temperature,
        apiKey: null,
      });

      console.log("sending request", { body });

      setUserMessage("");

      const url = `${baseUrl}/chat`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson = await response.json();

      console.log(`Response from ${url}`, { resJson });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: resJson?.data?.message,
          type: "bot",
          audio_file_url: resJson?.audio_file_url,
        },
      ]);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Error fetching transcript. Please try again.");
    }
  };

  const handleClearChat = () => {
    /**
     * Clears the chat.
     *
     * 1. Clear the cookies.
     * 2. Reset the `messages` state.
     * 3. Remove any errors.
     */
    clearChatIDCookie();
    setMessages([]);
    setError(null);
  };

  const newChat = () => {
    /** Reset ChatID and messages */

    // Delete old ChatID
    clearChatIDCookie();

    /** Update the cookies and chatID state. */
    const newChatId = generateUniqueID();
    setCookiesChatId(newChatId);
    setChatId(newChatId);

    // Reset messages
    if (messages.length > 0) {
      setMessages([]);
    }
  };

  const fetchPreviousMessages = async () => {
    /**
     * Get old messages based on the current ChatID, then update the `messages` state.
     *
     *  Note: This will not work unless the endpoint is created and running.
     */
    try {
      // Get the messages using the ChatID
      setIsLoadingMessages(true);
      const chatId = getChatID();
      const response = await fetch(`${baseUrl}/chat/messages/${chatId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resJson = await response.json();

      if (debug) {
        console.log("useChatbot, fetchPreviousMessages");
        console.log({ response });
        console.log("chat/messages response", { resJson });
        console.log(`Retrieved messages: ${resJson.data}`);
      }

      // Update messages array, and turn off loading state.
      setMessages(resJson.data);
      setError("");
      setIsLoadingMessages(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching messages.");
    }
  };

  useEffect(() => {
    /** Helper function to check a ChatID is set. */
    if (debug) {
      console.log(`Found messages for ${chatId}`, { messages });
    }
  }, [chatId, messages]);

  return {
    userMessage,
    messages,
    error,
    isLoadingMessages,
    handlePromptChange,
    handleSubmit,
    handleClearChat,
    model,
    setModel,
    promptTemplate,
    setPromptTemplate,
    temperature,
    setTemperature,
    fetchPreviousMessages,
    chatId,
    newChat,
  };
};

export default useChatbot;
