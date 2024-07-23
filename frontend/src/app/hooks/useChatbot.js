"use client";
import { useState, useEffect } from "react";
import {
  getChatID,
  generateUniqueID,
  generateTimeStamp,
  clearChatIDCookie,
  setCookiesChatId,
} from "../utils/chatHelpers";

const useChatbot = (debug = false) => {
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
  const [loadingNewMsg, setLoadingNewMsg] = useState(false);
  useEffect(() => {
    /**
     *  Fetch old messages on page load.
     *
     * 1. When the component is 'mounted' we check if the ChatID is present.
     * 2. If present, get old from the database.
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
        console.log(
          `Testing Chalice Deployed Root Endpoint: ${process.env.NEXT_PUBLIC_API_URL}`
        );
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL);

        console.log({ response });

        const resJson = await response.json();

        console.log({ resJson });
      } catch (err) {
        console.log(`error testing the endpoint: ${err}`);
      }
    };

    if (debug) {
      // testLambda();
    }
  }, []);

  const handlePromptChange = (e) => {
    setUserMessage(e.target.value);
  };

  let initialChatMessages = [
    {
      role: "bot",
      content:
        "hihi. i'm matchya, and i'm here to match ya with your perfect therapist! just like brewing the perfect matcha 🍵, every detail you provide will improve your match. oh ya and dw, everything is 100% confidential - chats are deleted after 24h. most of our therapists located in USA/Canada, but we have online therapists too. where are you located?",
    },
  ];

  const fetchInitialChatMessages = async () => {
    try {
      setLoadingNewMsg(true);

      setMessages(initialChatMessages);
      setLoadingNewMsg(false);
      setError("");
    } catch (err) {
      setLoadingNewMsg(false);
      console.error(err);
      setError("Error fetching messages. Please try again.");
    }
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
      setLoadingNewMsg(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: userMessage,
          role: "user",
          sourceDocuments: null,
          timestamp: timestamp,
          chat_id: chatId,
        },
      ]);

      const body = JSON.stringify({
        // message settings
        chat_id: chatId,
        timestamp: timestamp,
        message: userMessage,
        // chatbot settings
        model: model,
        prompt_template: promptTemplate,
        temperature: temperature,
        // additional settings, add as necesary.
        apiKey: null,
      });

      console.log("sending request", { body });

      setUserMessage("");

      const url = `${process.env.NEXT_PUBLIC_API_URL}/chat`;

      console.log({ url });

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
          content: resJson?.content,
          role: "assistant",
          audio_file_url: resJson?.audio_file_url,
          sourceDocuments: resJson?.source_documents,
        },
      ]);

      setError("");
      setLoadingNewMsg(false);
    } catch (err) {
      setLoadingNewMsg(false);
      console.error(err);
      setError("Error fetching messages. Please try again.");
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
    /** Phase 1: No need to use. */
    return;
  };
  // const fetchPreviousMessages = async () => {
  //   /**
  //    * Get old messages based on the current ChatID, then update the `messages` state.
  //    *
  //    *  Note: This will not work unless the endpoint is created and running.
  //    */
  //   try {
  //     // Get the messages using the ChatID
  //     setIsLoadingMessages(true);
  //     const chatId = getChatID();
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/messages/${chatId}`, {
  //       method: "GET",
  //     });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const resJson = await response.json();

  //     if (debug) {
  //       console.log("useChatbot, fetchPreviousMessages");
  //       console.log({ response });
  //       console.log("chat/messages response", { resJson });
  //       console.log(`Retrieved messages: ${resJson.data}`);
  //     }

  //     // Update messages array, and turn off loading state.
  //     setMessages(resJson.data);
  //     setError("");
  //     setIsLoadingMessages(false);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Error fetching messages.");
  //   }
  // };

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
    loadingNewMsg,
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
    fetchInitialChatMessages,
  };
};

export default useChatbot;
