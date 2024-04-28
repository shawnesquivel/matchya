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

  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [promptTemplate, setPromptTemplate] = useState("girlfriend");
  const [temperature, setTemperature] = useState(0.5);

  useEffect(() => {
    // Check cookies for ChatID
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

  useEffect(() => {
    // Define the async function inside the effect
  }, [chatId]); // Dependencies array

  const handlePromptChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const chatId = getChatID();
      const timestamp = generateTimeStamp();

      setMessages((prevMessages) => [
        ...prevMessages,
        { message: userMessage, type: "user", sourceDocuments: null },
      ]);

      const body = JSON.stringify({
        chat_id: chatId,
        timestamp: timestamp,
        message: userMessage,
        model: model,
        prompt_template: promptTemplate,
        temperature: temperature,
      });

      console.log("sending request", { body });

      setUserMessage("");

      const response = await fetch(`${baseUrl}/chat`, {
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

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: resJson?.data?.response,
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
    /** Note: This will not work unless the endpoint is created.. */
    try {
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

      // Push the response into the messages array
      setMessages(resJson.data);

      setError("");

      setIsLoadingMessages(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching messages.");
    }
  };

  useEffect(() => {
    if (debug) {
      console.log({ chatId });
      console.log(messages.reverse());
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
