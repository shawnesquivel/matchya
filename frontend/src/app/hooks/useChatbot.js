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
  const [chatId, setChatId] = useState(() => {
    const newChatId = generateUniqueID();
    setCookiesChatId(newChatId);
    return newChatId;
  });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);

    if (debug) {
      console.log({ chatId });
    }
  }, []);

  // ChatMessages
  const [userMessage, setUserMessage] = useState("");
  const [error, setError] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Chatbot Form
  const [model, setModel] = useState("gpt-4o");
  const [promptTemplate, setPromptTemplate] = useState("girlfriend");
  const [temperature, setTemperature] = useState(0.5);
  const [loadingNewMsg, setLoadingNewMsg] = useState(false);
  const [questionStage, setQuestionStage] = useState(0);
  const [finishedQuestions, setFinishedQuestions] = useState([]);
  const [initialChatMsg, setInitialChatMsg] = useState(true);

  // New: Structured preferences state with explicit keys (no therapyTypes field)
  const [preferences, setPreferences] = useState({
    reason: "", // question
    frequency: "", // e.g., "one_time"
    preferred_therapy: "", // e.g., "structured"
    session_type: "", // e.g., "group"
    insurance: null, // e.g., true/false
    insurance_provider: "", // e.g., "sunlife"
    gender: null, // e.g., "male" or "female"
    location: "Vancouver, BC", // default location
    additional_preferences: "", // any extra notes (freeform final user input)
  });

  // Update a specific preference field.
  const updatePreference = (key, value) => {
    console.log("updatePreference called", { key, value });
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // (Optional) A merge function if a field should aggregate multiple values,
  // but for the keys above, we expect a single value.
  const mergePreference = (key, valueArray) => {
    console.warn("mergePreference should not be used for key:", key);
    setPreferences((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? [...new Set([...prev[key], ...valueArray])]
        : valueArray,
    }));
  };

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
          value: "specific_problem",
          questionIndex: 0,
        },
        {
          content:
            "i have specific characteristics i want to change or improve in therapy.",
          icon: "brain",
          value: "improvement",
          questionIndex: 0,
        },
        {
          content: "i want to become a mentally healthier version of myself.",
          icon: "heart",
          value: "growth",
          questionIndex: 0,
        },
        {
          content:
            "i don't have an exact reason for why i want to see a therapist.",
          icon: "question-mark",
          value: "uncertain",
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
          value: "trial",
          questionIndex: 1,
        },
        {
          content: "i want to see a therapist just one time.",
          icon: "clock",
          value: "one_time",
          questionIndex: 1,
        },
        {
          content: "i want to address a problem in 2-4 sessions.",
          icon: "hourglass",
          value: "few_sessions",
          questionIndex: 1,
        },
        {
          content: "i'm looking for a longer term therapist.",
          icon: "chat",
          value: "long_term",
          questionIndex: 1,
        },
        {
          content:
            "i have low insurance coverage and a limited number of sessions.",
          icon: "money",
          value: "low_coverage",
          questionIndex: 1,
        },
      ],
    },
    {
      role: "assistant",
      content:
        "very helpful, thanks! you're doing great :) there are many types of therapy. which of the following resonates best with you?",
      type: "questionnaire",
      questionIndex: 2,
      buttons: [
        {
          content:
            'structured and goal-oriented. "i like structure and a clear outcome"',
          icon: "target",
          value: "structured",
          questionIndex: 2,
        },
        {
          content:
            'exploratory and insight-oriented. "i want to explore my thoughts and emotions"',
          icon: "compass",
          value: "exploratory",
          questionIndex: 2,
        },
        {
          content:
            'skill-building and mindfulness-focused. "i want to build skills and healthy habits"',
          icon: "mind",
          value: "skill_building",
          questionIndex: 2,
        },
        {
          content:
            'flexible and client-centered. "i\'m not sure what i need yet"',
          icon: "expand",
          value: "client_centered",
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
          value: "one_on_one",
          questionIndex: 3,
        },
        {
          content: "i'm open to group sessions.",
          icon: "group",
          value: "group",
          questionIndex: 3,
        },
        {
          content: "i'd like online/remote sessions.",
          icon: "video",
          value: "remote",
          questionIndex: 3,
        },
        {
          content: "i prefer in-person sessions.",
          icon: "in-person",
          value: "in_person",
          questionIndex: 3,
        },
      ],
    },
    {
      role: "assistant",
      content:
        "let's talk about insurance coverage. do you have extended health benefits?",
      type: "questionnaire",
      questionIndex: 4,
      buttons: [
        {
          content: "yes, i have insurance coverage",
          icon: "checkmark",
          value: "has_insurance",
          questionIndex: 4,
        },
        {
          content: "no insurance coverage",
          icon: "x-mark",
          value: "no_insurance",
          questionIndex: 4,
        },
        {
          content: "i'm not sure about my coverage",
          icon: "question",
          value: "unknown_insurance",
          questionIndex: 4,
        },
      ],
    },
    {
      role: "assistant",
      content: "which insurance provider do you have?",
      type: "questionnaire",
      questionIndex: 5,
      buttons: [
        {
          content: "Blue Cross",
          icon: "blue-cross",
          value: "blue_cross",
          questionIndex: 5,
        },
        {
          content: "Sun Life",
          icon: "sun-life",
          value: "sun_life",
          questionIndex: 5,
        },
        {
          content: "Manulife",
          icon: "manulife",
          value: "manulife",
          questionIndex: 5,
        },
        {
          content: "Desjardins",
          icon: "desjardins",
          value: "desjardins",
          questionIndex: 5,
        },
        {
          content: "GMS",
          icon: "gms",
          value: "gms",
          questionIndex: 5,
        },
        {
          content: "Greenshield",
          icon: "greenshield",
          value: "greenshield",
          questionIndex: 5,
        },
        {
          content: "Other Provider",
          icon: "other",
          value: "other_insurance",
          questionIndex: 5,
        },
      ],
    },
    {
      role: "assistant",
      content: `lastly ~ do you have any other preferences you'd like to share? some users share experience with specific issues, preferences for gender/ethnicity/sexuality, language(s), faith. you can enter it in the chat below.`,
      type: "chat",
      questionIndex: 6,
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

      console.log("Messages before adding user message:", messages);

      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          {
            content: userMessage,
            role: "user",
            sourceDocuments: null,
            timestamp: timestamp,
            chat_id: chatId,
            preferences: preferences,
          },
        ];
        console.log("Messages after adding user message:", newMessages);
        return newMessages;
      });

      const request = {
        chat_id: chatId,
        message: userMessage,
        questionnaire: finishedQuestions,
        preferences: preferences, // pass on our structured preferences
      };

      const requestBody = JSON.stringify(request);

      console.log("sending CHAT request", { requestBody });

      setUserMessage("");

      // Production
      const url = `${process.env.NEXT_PUBLIC_API_URL}/chat`;

      // Local
      // const url = "http://127.0.0.1:3000/chat";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error || `HTTP error! status: ${response.status}`
          );
        } catch (err) {
          // If JSON parsing fails, use the plain text error response:
          throw new Error(
            errorText || `HTTP error! status: ${response.status}`
          );
        }
      }

      const resJson = await response.json();

      console.log(`Response from ${url}`, { resJson });

      // Add assistant message to the local state
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          {
            content: resJson.content,
            role: resJson.role,
            audio_file_url: resJson.audio_file_url,
            sourceDocuments: resJson.source_documents,
            timestamp: resJson.timestamp,
            chat_id: resJson.chat_id,
          },
        ];
        console.log("Messages after adding bot response:", newMessages);
        return newMessages;
      });

      setInitialChatMsg(false);
      setError("");
      setLoadingNewMsg(false);
    } catch (err) {
      setLoadingNewMsg(false);
      console.error(err);
      setError(err.message || "Error fetching messages. Please try again.");
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

    if (messages.length > 0) {
      setMessages([]);
    }

    // Reset the structured preferences to defaults.
    setPreferences({
      reason: "",
      frequency: "",
      preferred_therapy: "",
      session_type: "",
      insurance: null,
      insurance_provider: "",
      gender: null,
      location: "Vancouver, BC",
      additional_preferences: "",
    });
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
  const handleButtonClick = async (value, content, clickedQuestionIndex) => {
    switch (clickedQuestionIndex) {
      case 0: {
        // For question 0, update the "reason"
        console.log("Updating reason with", value);
        updatePreference("reason", value);
        break;
      }
      case 1: {
        // For question 1, update the "frequency"
        console.log("Updating frequency with", value);
        updatePreference("frequency", value);
        break;
      }
      case 2: {
        // For question 2, update "preferred_therapy"
        console.log("Updating preferred_therapy with", value);
        updatePreference("preferred_therapy", value);
        break;
      }
      case 3: {
        // For question 3, update "session_type"
        console.log("Updating session_type with", value);
        updatePreference("session_type", value);
        break;
      }
      case 4: {
        // For question 4, update insurance status.
        const hasInsurance = value === "has_insurance";
        console.log("Updating insurance with", hasInsurance);
        updatePreference("insurance", hasInsurance);
        // Depending on the answer, you may want to show or skip question 5.
        break;
      }
      case 5: {
        // For question 5, update "insurance_provider"
        console.log("Updating insurance_provider with", value);
        updatePreference("insurance_provider", value);
        break;
      }
      default:
        console.log(
          "Unhandled question index in handleButtonClick:",
          clickedQuestionIndex
        );
    }

    // Continue with your existing flow to push a new message,
    // display the next question, and toggle questionStage if needed.
    // (Make sure none of this additional logic calls mergePreference("therapyTypes", ...))

    // Example: Append a message to messages and then simulate the AI typing delay.
    try {
      setLoadingNewMsg(true);
      const newQuestionIndex = clickedQuestionIndex + 1;
      // Add new question message if it exists:
      if (questions[newQuestionIndex]) {
        const nextMsg = questions[newQuestionIndex];
        setMessages((prev) => [
          ...prev,
          { ...nextMsg, content: nextMsg.content, isTyping: true },
        ]);
        // Update questionStage to trigger the UI to render the next question.
        console.log("Advancing to question stage:", newQuestionIndex);
        setQuestionStage(newQuestionIndex);
      }
      await new Promise((resolve) => setTimeout(resolve, content.length * 10));
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, isTyping: false } : msg
        )
      );
      setLoadingNewMsg(false);
    } catch (err) {
      console.error(err);
      setError("Error processing your choice. Please try again.");
      setLoadingNewMsg(false);
    }
  };

  // Add health check function
  const checkHealth = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/health`;
      const response = await fetch(url);
      const data = await response.json();
      console.log("Health check response:", url, data);
      return data;
    } catch (err) {
      console.error("Health check failed:", err);
      return null;
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
    preferences,
    updatePreference,
    checkHealth,
  };
};

export default useChatbot;
