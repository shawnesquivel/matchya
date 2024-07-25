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
  const [questionStage, setQuestionStage] = useState(0);

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

  const questions = [
    {
      role: "bot",
      content: "what best describes your main reason for seeking therapy?",
      type: "questionnaire",
      questionIndex: 0,
      buttons: [
        {
          content:
            "i have a specific situational problem i want to address with therapy.",
          icon: "hazard",
          value: [
            "cognitive behavioral therapy",
            "solution-focused brief therapy",
          ],
          questionIndex: 0,
        },
        {
          content:
            "i have specific characteristics i want to change or improve in therapy.",
          icon: "brain",
          value: [
            "cognitive behavioral therapy",
            "dialectical behavior therapy",
          ],
          questionIndex: 0,
        },
        {
          content: "i want to become a mentally healthier version of myself.",
          icon: "heart",
          value: [
            "person-centered therapy",
            "mindfulness-based cognitive therapy",
          ],
          questionIndex: 0,
        },
        {
          content: "i don't know why i want to see a therapist.",
          icon: "question-mark",
          value: ["psychodynamic therapy", "integrative therapy"],
          questionIndex: 0,
        },
      ],
    },
    {
      role: "bot",
      content:
        "which describes your situation best regarding therapy duration and frequency?",
      type: "questionnaire",
      questionIndex: 1,
      buttons: [
        {
          content: "i want to try therapy and see what would be best for me.",
          icon: "hazard",
          value: ["integrative therapy", "person-centered therapy"],
          questionIndex: 1,
        },
        {
          content: "i want to see a therapist just one time.",
          icon: "brain",
          value: ["single session therapy", "crisis counselling"],
          questionIndex: 1,
        },
        {
          content: "i want to address a problem in 2-4 sessions.",
          icon: "heart",
          value: ["psychodynamic therapy", "dialetical behavior therapy"],
          questionIndex: 1,
        },
        {
          content:
            "i have low insurance coverage and a limited number of sessions.",
          icon: "question-mark",
          value: ["cognitive behavioral therapy", "group therapy"],
          questionIndex: 1,
        },
      ],
    },
    {
      role: "bot",
      content: "which therapeutic approach resonates most with you?",
      type: "questionnaire",
      questionIndex: 2,
      buttons: [
        {
          content:
            'structured and goal-oriented. "i like structure and a clear outcome"',
          icon: "hazard",
          value: [
            "cognitive behavioral therapy",
            "solution-focused brief therapy",
          ],
          questionIndex: 2,
        },
        {
          content:
            'exploratory and insight-oriented. "i want to explore my thoughts and emotions"',
          icon: "brain",
          value: ["psychodynamic therapy", "integrative therapy"],
          questionIndex: 2,
        },
        {
          content:
            'skill-building and mindfulness-focused. "i want to build skills and healthy habits"',
          icon: "heart",
          value: [
            "dialectical behavior therapy",
            "mindfulness-based cognitive therapy",
          ],
          questionIndex: 2,
        },
        {
          content:
            'flexible and client-centered. "i\'m not sure what i need yet"',
          icon: "question-mark",
          value: ["person-centered therapy", "integrative therapy"],
          questionIndex: 2,
        },
      ],
    },
    {
      role: "bot",
      content:
        "what type of therapy setting are you most comfortable with? select one or more. don't worry, you can always change this later.",
      type: "questionnaire",
      questionIndex: 3,
      buttons: [
        {
          content: "i prefer one-on-one sessions.",
          icon: "hazard",
          value: ["most therapeutic approaches"],
          questionIndex: 3,
        },
        {
          content: "i'm open to group sessions.",
          icon: "brain",
          value: ["group therapy", "dialectical behavior therapy"],
          questionIndex: 3,
        },
        {
          content: "i'd like online/remote sessions.",
          icon: "heart",
          value: ["cognitive behavioral therapy", "integrative therapy"],
          questionIndex: 3,
        },
        {
          content: "i prefer in-person sessions.",
          icon: "question-mark",
          value: ["most therapeutic approaches"],
          questionIndex: 3,
        },
      ],
    },
    {
      role: "bot",
      content:
        "thanks for the info! do you have any other soft preferences you'd like to share?",
      type: "chat",
      questionIndex: 4,
    },
  ];

  let initialChatMessages = [
    {
      role: "bot",
      content:
        "hihi. i'm matchya, and i'm here to match you with your ideal therapist.",
    },
    {
      role: "bot",
      content:
        "the more details you can provide, the better match i can find you.",
    },
    questions[0],
  ];

  const fetchInitialChatMessages = async () => {
    try {
      setLoadingNewMsg(true);
      setMessages([]);
      setError("");

      for (let i = 0; i < initialChatMessages.length; i++) {
        const message = initialChatMessages[i];

        // Add the full message immediately, but with a flag to indicate it's not fully typed
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...message, content: message.content, isTyping: true },
        ]);

        // Simulate typing delay
        await new Promise((resolve) =>
          setTimeout(resolve, message.content.length * 10)
        );

        // Update the message to indicate typing is complete
        setMessages((prevMessages) =>
          prevMessages.map((msg, index) =>
            index === prevMessages.length - 1
              ? { ...msg, isTyping: false }
              : msg
          )
        );

        if (i < initialChatMessages.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setLoadingNewMsg(false);
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

      // Add user message to the local state
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

      const requestBody = JSON.stringify({
        chat_id: chatId,
        message: userMessage,
      });

      console.log("sending CHAT request", { requestBody });

      setUserMessage("");

      const url = `${process.env.NEXT_PUBLIC_API_URL}/chat`;

      console.log("Fetching Chat", { url });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resJson = await response.json();

      console.log(`Response from ${url}`, { resJson });

      // Add assistant message to the local state
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: resJson.content,
          role: resJson.role,
          audio_file_url: resJson.audio_file_url,
          sourceDocuments: resJson.source_documents,
          timestamp: resJson.timestamp,
          chat_id: resJson.chat_id,
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

  const handleButtonClick = async (value, clickedQuestionIndex) => {
    try {
      const newQuestionIndex = clickedQuestionIndex + 1;
      setQuestionStage(newQuestionIndex);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: value,
          role: "user",
          timestamp: generateTimeStamp(),
          chat_id: getChatID(),
        },
      ]);

      if (newQuestionIndex <= 4) {
        const message = questions[newQuestionIndex];
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...message, content: message.content, isTyping: true },
        ]);

        await new Promise((resolve) =>
          setTimeout(resolve, message.content.length * 10)
        );
        setMessages((prevMessages) =>
          prevMessages.map((msg, index) =>
            index === prevMessages.length - 1
              ? { ...msg, isTyping: false }
              : msg
          )
        );
      }

      if (newQuestionIndex === 4) {
        // enable the chat again
        // render the last quesiton in the list
      }

      setLoadingNewMsg(false);
    } catch (err) {
      console.error(err);
      setError("Error processing your choice. Please try again.");
      setLoadingNewMsg(false);
    }
  };

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
    handleButtonClick,
    questionStage,
  };
};

export default useChatbot;
