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
  const [finishedQuestions, setFinishedQuestions] = useState([]);
  const [initialChatMsg, setInitialChatMsg] = useState(true);

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
      role: "assistant",
      content:
        "first, what best describes your main reason for seeking therapy?",
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
          content:
            "i don't have an exact reason for why i want to see a therapist.",
          icon: "question-mark",
          value: ["psychodynamic therapy", "integrative therapy"],
          questionIndex: 0,
        },
      ],
    },
    {
      role: "assistant",
      content:
        "great, thanks for sharing! do you have an idea for how frequently you want to see a therapist?",
      type: "questionnaire",
      questionIndex: 1,
      buttons: [
        {
          content: "i want to try therapy and see what would be best for me.",
          icon: "door",
          value: ["integrative therapy", "person-centered therapy"],
          questionIndex: 1,
        },
        {
          content: "i want to see a therapist just one time.",
          icon: "clock",
          value: ["single session therapy (SST)", "crisis counselling"],
          questionIndex: 1,
        },
        {
          content: "i want to address a problem in 2-4 sessions.",
          icon: "hourglass",
          value: [
            "solution focused brief therapy (SFBT)",
            "crisis counselling",
          ],
          questionIndex: 1,
        },
        {
          content: "i'm looking for a longer term therapist.",
          icon: "chat",
          value: ["psychodynamic therapy", "dialetical behavior therapy"],
          questionIndex: 1,
        },
        {
          content:
            "i have low insurance coverage and a limited number of sessions.",
          icon: "money",
          value: ["cognitive behavioral therapy", "group therapy"],
          questionIndex: 1,
        },
      ],
    },
    {
      role: "assistant",
      content:
        "mm, i see! just 3 more questions to go, you're doing great :) there are many types of therapy. which of the following resonates best with you?",
      type: "questionnaire",
      questionIndex: 2,
      buttons: [
        {
          content:
            'structured and goal-oriented. "i like structure and a clear outcome"',
          icon: "target",
          value: [
            "cognitive behavioral therapy",
            "solution-focused brief therapy",
          ],
          questionIndex: 2,
        },
        {
          content:
            'exploratory and insight-oriented. "i want to explore my thoughts and emotions"',
          icon: "compass",
          value: ["psychodynamic therapy", "integrative therapy"],
          questionIndex: 2,
        },
        {
          content:
            'skill-building and mindfulness-focused. "i want to build skills and healthy habits"',
          icon: "mind",
          value: [
            "dialectical behavior therapy",
            "mindfulness-based cognitive therapy",
          ],
          questionIndex: 2,
        },
        {
          content:
            'flexible and client-centered. "i\'m not sure what i need yet"',
          icon: "expand",
          value: ["person-centered therapy", "integrative therapy"],
          questionIndex: 2,
        },
      ],
    },
    {
      role: "assistant",
      content:
        "awesome! do you have a type of therapy setting you prefer? don't worry, you can always change this later :)",
      type: "questionnaire",
      questionIndex: 3,
      buttons: [
        {
          content: "i prefer one-on-one sessions.",
          icon: "one-on-one",
          value: ["most therapeutic approaches"],
          questionIndex: 3,
        },
        {
          content: "i'm open to group sessions.",
          icon: "group",
          value: ["group therapy", "dialectical behavior therapy"],
          questionIndex: 3,
        },
        {
          content: "i'd like online/remote sessions.",
          icon: "video",
          value: ["cognitive behavioral therapy", "integrative therapy"],
          questionIndex: 3,
        },
        {
          content: "i prefer in-person sessions.",
          icon: "in-person",
          value: ["most therapeutic approaches"],
          questionIndex: 3,
        },
      ],
    },
    {
      role: "assistant",
      content: `got it, last question ~ do you have preferences you'd like to share? some users share experience with specific issues, preferences for gender/ethnicity/sexuality, language(s), faith. you can enter it in the chat below.`,
      type: "chat",
      questionIndex: 4,
    },
  ];

  let initialChatMessages = [
    {
      role: "assistant",
      content:
        "hihi. i'm matchya. i'm here to help you find your ideal therapist!",
    },
    {
      role: "assistant",
      content:
        "to help match you with the right therapist, i'll ask you some questions. it'll be quick and 100% confidential.",
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
      const request = {
        chat_id: chatId,
        message: userMessage,
        questionnaire: null,
      };
      if (initialChatMsg && finishedQuestions && finishedQuestions.length > 0) {
        console.log(
          "The questionnaire has not been included yet, we'll include it.",
          initialChatMsg
        );
        request.questionnaire = finishedQuestions;
      } else {
        console.log("The questionnaire was already sent. I won't include it.");
      }

      const requestBody = JSON.stringify(request);

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

      

      setInitialChatMsg(false);
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
    /**
     * Handles the button click event by updating the state with the user's response,
     * advancing the question stage, and adding the bot's and user's messages to the finished questions array.
     * If there are more questions, it sets the next question as typing and then updates it to not typing after a delay.
     */
    try {
      const newQuestionIndex = clickedQuestionIndex + 1;

      const userResponse = {
        content: value,
        role: "user",
        timestamp: generateTimeStamp(),
        chat_id: getChatID(),
      };
      setQuestionStage(newQuestionIndex);

      const previousBotMsg = {
        content: messages[messages.length - 1].content,
        role: messages[messages.length - 1].role,
      };

      // Update render messages object
      setMessages((prevMessages) => [...prevMessages, userResponse]);

      // Update the questionnaire holder
      setFinishedQuestions((prev) => [...prev, previousBotMsg, userResponse]);

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
