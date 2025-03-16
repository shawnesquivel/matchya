"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// Add imports for cookie management
import {
  getChatID,
  setCookiesChatId,
  clearChatIDCookie,
  generateUniqueID,
} from "../utils/chatHelpers";

// Define filter types
interface TherapistFilters {
  gender: string | null;
  sexuality: string[] | null;
  ethnicity: string[] | null;
  faith: string[] | null;
  max_price_initial: number | null;
  max_price_subsequent: number | null;
  availability: string | null;
  format: string[] | null;
}

// Add license interface
interface TherapistLicense {
  id: string;
  license_number: string;
  state: string; // From jurisdiction_type enum
  title: string; // From license_title_type enum
  issuing_body: string;
  expiry_date: string | null;
  is_verified: boolean;
}

// Update therapist interface to include licenses
export interface Therapist {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  pronouns?: string;
  gender: "female" | "male" | "non_binary";
  ethnicity: string[];
  sexuality: string[];
  faith: string[];
  bio?: string;
  ai_summary?: string;
  areas_of_focus: string[];
  approaches: string[];
  profile_img_url?: string;
  video_intro_link?: string;
  clinic_profile_url?: string;
  clinic_booking_url?: string;
  therapist_email?: string;
  therapist_phone?: string;
  clinic_name: string;
  clinic_street: string;
  clinic_city: string;
  clinic_province: string;
  clinic_postal_code: string;
  clinic_country: string;
  clinic_phone?: string;
  availability: "online" | "in_person" | "both";
  languages: string[];
  education: string[];
  certifications: string[];
  initial_price?: string;
  subsequent_price?: string;
  similarity?: number;
  licenses: TherapistLicense[];
  is_verified: boolean;
}

// Initial state
const initialState = {
  // Chat state - use getChatID() first, fallback to UUID
  chatId: getChatID() || crypto.randomUUID(),
  messages: [],

  // Filter state (matching database schema)
  filters: {
    gender: null,
    sexuality: null,
    ethnicity: null,
    faith: null,
    max_price_initial: null,
    max_price_subsequent: null,
    availability: null,
    format: null,
  },

  // UI state
  isLoading: false,
  isSendingChat: false,
  error: null,
  lastRequestTime: null,
  requestCount: 0,

  // Results
  therapists: [] as Therapist[],

  // New flags
  skipFilterEffect: false,
  useMockData: false,

  // Additional state variables
  isTherapistLoading: false,
  isChatLoading: false,
  isFormDisabled: false,

  // New flag for tracking history loading state
  isLoadingHistory: false,

  // Follow-up questions
  followUpQuestions: [],
  isLoadingFollowUps: false,
};

// Create context
const TherapistContext = createContext(null);

// New unified update types
type DirectFilterUpdate = {
  type: "DIRECT";
  filters: Partial<TherapistFilters>;
};

type ChatBasedUpdate = {
  type: "CHAT";
  message: string;
};

type TherapistUpdate = DirectFilterUpdate | ChatBasedUpdate;

// Add new action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_MESSAGES: "SET_MESSAGES",
  SET_THERAPISTS: "SET_THERAPISTS",
  RESET_CHAT: "RESET_CHAT",
  INCREMENT_REQUEST_COUNT: "INCREMENT_REQUEST_COUNT",
  SET_SENDING_CHAT: "SET_SENDING_CHAT",
  SET_FILTERS_AND_THERAPISTS: "SET_FILTERS_AND_THERAPISTS",
  SET_SKIP_FILTER_EFFECT: "SET_SKIP_FILTER_EFFECT",
  SET_LAST_REQUEST_TIME: "SET_LAST_REQUEST_TIME",
  SET_THERAPIST_LOADING: "SET_THERAPIST_LOADING",
  SET_CHAT_LOADING: "SET_CHAT_LOADING",
  SET_FORM_DISABLED: "SET_FORM_DISABLED",
  TOGGLE_MOCK_DATA: "TOGGLE_MOCK_DATA",
  UPDATE_CHAT_RESULTS: "UPDATE_CHAT_RESULTS",
  UPDATE_FILTER_RESULTS: "UPDATE_FILTER_RESULTS",
  SET_LOADING_STATE: "SET_LOADING_STATE",
  ADD_USER_MESSAGE: "ADD_USER_MESSAGE",
  SET_LOADING_HISTORY: "SET_LOADING_HISTORY",
  SET_CHAT_ID: "SET_CHAT_ID",
  REMOVE_TYPING_MESSAGE: "REMOVE_TYPING_MESSAGE",
  SET_FOLLOW_UP_QUESTIONS: "SET_FOLLOW_UP_QUESTIONS",
  SET_LOADING_FOLLOW_UPS: "SET_LOADING_FOLLOW_UPS",
};

// Reducer function
function therapistReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_SENDING_CHAT:
      return { ...state, isSendingChat: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };

    case ACTIONS.REMOVE_TYPING_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    case ACTIONS.SET_THERAPISTS:
      return { ...state, therapists: action.payload };

    case ACTIONS.RESET_CHAT:
      return {
        ...initialState,
        chatId: action.payload?.chatId || crypto.randomUUID(),
        requestCount: state.requestCount,
        followUpQuestions: [], // Clear follow-up questions on reset
      };

    case ACTIONS.INCREMENT_REQUEST_COUNT:
      return {
        ...state,
        requestCount: state.requestCount + 1,
      };

    case ACTIONS.SET_FILTERS_AND_THERAPISTS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload.filters },
        therapists: action.payload.therapists,
        skipFilterEffect: true,
      };

    case ACTIONS.SET_SKIP_FILTER_EFFECT:
      return {
        ...state,
        skipFilterEffect: action.payload,
      };

    case ACTIONS.SET_LAST_REQUEST_TIME:
      return {
        ...state,
        lastRequestTime: action.payload,
      };

    case ACTIONS.SET_THERAPIST_LOADING:
      return {
        ...state,
        isTherapistLoading: action.payload,
      };

    case ACTIONS.SET_CHAT_LOADING:
      return {
        ...state,
        isChatLoading: action.payload,
      };

    case ACTIONS.SET_FORM_DISABLED:
      return {
        ...state,
        isFormDisabled: action.payload,
      };

    case ACTIONS.TOGGLE_MOCK_DATA:
      return {
        ...state,
        useMockData:
          action.payload !== undefined ? action.payload : !state.useMockData,
      };

    case ACTIONS.UPDATE_CHAT_RESULTS:
      return {
        ...state,
        therapists: action.payload.therapists,
        filters: { ...state.filters, ...action.payload.filters },
      };

    case ACTIONS.UPDATE_FILTER_RESULTS:
      return {
        ...state,
        therapists: action.payload.therapists,
        filters: action.payload.filters,
      };

    case ACTIONS.SET_LOADING_STATE:
      return {
        ...state,
        isLoading: action.payload,
        isTherapistLoading: action.payload,
        isChatLoading: action.payload,
        isFormDisabled: action.payload,
      };

    case ACTIONS.ADD_USER_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            role: "user",
            content: action.payload,
            id: Date.now().toString(), // Add unique ID for user messages
          },
        ],
      };

    case ACTIONS.SET_LOADING_HISTORY:
      return {
        ...state,
        isLoadingHistory: action.payload,
      };

    case ACTIONS.SET_CHAT_ID:
      return {
        ...state,
        chatId: action.payload,
      };

    case ACTIONS.SET_FOLLOW_UP_QUESTIONS:
      return {
        ...state,
        followUpQuestions: action.payload,
      };

    case ACTIONS.SET_LOADING_FOLLOW_UPS:
      return {
        ...state,
        isLoadingFollowUps: action.payload,
      };

    default:
      return state;
  }
}

// Provider component
export function TherapistProvider({ children }) {
  const [state, dispatch] = useReducer(therapistReducer, initialState);
  const supabase = createClientComponentClient();

  // Initialize chat ID and load history on mount
  useEffect(() => {
    // If we have a chatId in state but not in cookies, set it
    if (state.chatId && !getChatID()) {
      setCookiesChatId(state.chatId);
    }

    // If we have a chatId, load history
    if (state.chatId) {
      loadChatHistory(state.chatId);
    }
  }, []);

  // Add a welcome message after loading history or if no messages exist
  useEffect(() => {
    if (!state.isLoadingHistory && state.messages.length === 0) {
      // Add welcome message that won't be stored in the database
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: {
          role: "assistant",
          content:
            "Hi! Thank you for making the first step to finding your perfect therapist. I'm here to help! \n\nThe more you're comfortable sharing about what you're looking for with me, the better I can match you with the right therapist. Don't worry, there's no way to mess this up – any information you share is fully confidential. \n\nWhen you're ready, just start chatting and I'll guide you the rest of the way :)",
          isWelcomeMessage: true, // Flag to identify this as a welcome message
        },
      });
    }
  }, [state.isLoadingHistory, state.messages.length]);

  // Add loadChatHistory function
  const loadChatHistory = async (chatId) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING_HISTORY, payload: true });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-chat-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ chatId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status}`);
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        // Convert to the expected format
        const formattedMessages = data.messages
          .map((msg) => ({
            role: msg.source === "USER" ? "user" : "assistant",
            content: msg.message,
            id: msg.id.toString(),
            timestamp: msg.created_at, // Keep timestamp for sorting
          }))
          // Ensure messages are in chronological order
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        dispatch({ type: ACTIONS.SET_MESSAGES, payload: formattedMessages });
      } else {
        // If no messages returned, set an empty array to ensure welcome message will show
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: [] });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: "Failed to load chat history",
      });
      // On error, ensure messages are empty to show welcome message
      dispatch({ type: ACTIONS.SET_MESSAGES, payload: [] });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_HISTORY, payload: false });
    }
  };

  const addMessage = (message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  };

  const resetChat = () => {
    const newChatId = generateUniqueID();
    setCookiesChatId(newChatId); // Store in cookie
    dispatch({ type: ACTIONS.RESET_CHAT, payload: { chatId: newChatId } });

    // Add welcome message after reset
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: {
        role: "assistant",
        content:
          "Ready to find your match?\n\nUse the filters on the left to refine your search, or simply describe what you're looking for in the chat.",
        isWelcomeMessage: true, // Flag to identify this as a welcome message
      },
    });
  };

  const deduplicateTherapists = (therapists: Therapist[]): Therapist[] => {
    if (!therapists || !therapists.length) return [];
    return Array.from(
      new Map(therapists.map((therapist) => [therapist.id, therapist])).values()
    );
  };

  // New unified update function
  const updateTherapists = async (update: TherapistUpdate) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING_STATE, payload: true });

      if (update.type === "CHAT") {
        // Set isSendingChat to true when starting a chat request
        dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: true });

        // Clear any existing follow-up questions
        dispatch({ type: ACTIONS.SET_FOLLOW_UP_QUESTIONS, payload: [] });

        // Add user message to state immediately
        dispatch({
          type: ACTIONS.ADD_USER_MESSAGE,
          payload: update.message,
        });

        // Add a temporary "typing" message from the assistant to show animation
        const typingMessageId = Date.now().toString();
        dispatch({
          type: ACTIONS.ADD_MESSAGE,
          payload: {
            id: typingMessageId,
            role: "assistant",
            content: "",
            isTyping: true, // This flag indicates typing animation should show
          },
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              messages: [
                // Filter out welcome messages before sending to server
                ...state.messages.filter((msg) => !msg.isWelcomeMessage),
                { role: "user", content: update.message },
              ],
              currentFilters: state.filters,
              triggerSource: "CHAT",
              lastUserMessage: update.message,
              filterOnly: false,
            }),
          }
        );

        const matchData = await response.json();

        if (matchData.therapists && Array.isArray(matchData.therapists)) {
          const uniqueTherapists = deduplicateTherapists(matchData.therapists);
          dispatch({
            type: ACTIONS.UPDATE_CHAT_RESULTS,
            payload: {
              therapists: uniqueTherapists,
              filters: matchData.extractedFilters || {},
              message: update.message,
            },
          });
        }

        // Process chat response - pass chatId to enable history storage
        const chatResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-v3`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              chatId: state.chatId, // Pass the chatId for history storage
              messages: [
                // Filter out welcome messages before sending to server
                ...state.messages.filter((msg) => !msg.isWelcomeMessage),
                { role: "user", content: update.message },
              ],
              matchedTherapists: matchData.therapists || [],
            }),
          }
        );

        if (!chatResponse.ok) {
          throw new Error(
            `Failed to get chat response: ${chatResponse.status}`
          );
        }

        const chatData = await chatResponse.json();

        // Remove the temporary typing message
        dispatch({
          type: ACTIONS.REMOVE_TYPING_MESSAGE,
          payload: typingMessageId,
        });

        if (chatData.message) {
          dispatch({
            type: ACTIONS.ADD_MESSAGE,
            payload: {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: chatData.message,
            },
          });
        }

        // After receiving the main response, fetch follow-up questions
        await fetchFollowUpQuestions(
          update.message,
          matchData.therapists || []
        );

        // Set isSendingChat back to false when chat response is received
        dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: false });
      } else {
        // Direct filter flow
        const mergedFilters = { ...state.filters, ...update.filters };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              currentFilters: mergedFilters,
              triggerSource: "FORM",
              filterOnly: true,
            }),
          }
        );

        const data = await response.json();

        if (data?.therapists) {
          const uniqueTherapists = deduplicateTherapists(data.therapists);
          dispatch({
            type: ACTIONS.UPDATE_FILTER_RESULTS,
            payload: {
              therapists: uniqueTherapists,
              filters: mergedFilters,
            },
          });
        }
      }

      dispatch({
        type: ACTIONS.SET_LAST_REQUEST_TIME,
        payload: new Date().toISOString(),
      });
      dispatch({ type: ACTIONS.INCREMENT_REQUEST_COUNT });
    } catch (error) {
      console.error("[updateTherapists] Error:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.toString() });

      // If there's a typing message, remove it even if there was an error
      if (update.type === "CHAT") {
        dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: false });
        // Find and remove any typing messages
        const typingMessages = state.messages.filter((msg) => msg.isTyping);
        typingMessages.forEach((msg) => {
          if (msg.id) {
            dispatch({ type: ACTIONS.REMOVE_TYPING_MESSAGE, payload: msg.id });
          }
        });
      }
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_STATE, payload: false });
    }
  };

  // Add new function to fetch follow-up questions
  const fetchFollowUpQuestions = async (lastUserMessage, matchedTherapists) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING_FOLLOW_UPS, payload: true });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/follow-up-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: state.messages.filter((msg) => !msg.isWelcomeMessage),
            matchedTherapists: matchedTherapists,
            lastUserMessage: lastUserMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get follow-up questions: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        // Add unique IDs to the questions to track them
        const questionsWithIds = data.questions.map((q) => ({
          ...q,
          id: `followup-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        }));

        dispatch({
          type: ACTIONS.SET_FOLLOW_UP_QUESTIONS,
          payload: questionsWithIds,
        });
      }
    } catch (error) {
      console.error("[fetchFollowUpQuestions] Error:", error);
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_FOLLOW_UPS, payload: false });
    }
  };

  // Add sendFollowUpQuestion function to handle when a user clicks a question
  const sendFollowUpQuestion = async (questionText, questionId) => {
    // Remove the question from the state
    const updatedQuestions = state.followUpQuestions.filter(
      (q) => q.id !== questionId
    );
    dispatch({
      type: ACTIONS.SET_FOLLOW_UP_QUESTIONS,
      payload: updatedQuestions,
    });

    // Send the question as a user message
    await updateTherapists({ type: "CHAT", message: questionText });
  };

  const toggleMockData = (value?: boolean) => {
    console.log(
      "[Context] Toggling mock data mode:",
      value !== undefined ? value : !state.useMockData
    );
    dispatch({
      type: ACTIONS.TOGGLE_MOCK_DATA,
      payload: value,
    });
  };

  const normalizeMessage = (msg) => ({
    role: msg.role,
    content: msg.content || (msg.parts?.[0]?.text ?? null),
  });

  return (
    <TherapistContext.Provider
      value={{
        ...state,
        addMessage,
        resetChat,
        updateTherapists,
        toggleMockData,
        normalizeMessage,
        isTherapistLoading: state.isTherapistLoading,
        isChatLoading: state.isChatLoading,
        isFormDisabled: state.isFormDisabled,
        useMockData: state.useMockData,
        isLoadingHistory: state.isLoadingHistory,
        loadChatHistory,
        followUpQuestions: state.followUpQuestions,
        isLoadingFollowUps: state.isLoadingFollowUps,
        sendFollowUpQuestion,
      }}
    >
      {children}
    </TherapistContext.Provider>
  );
}

// Custom hook for using the context
export function useTherapist() {
  const context = useContext(TherapistContext);
  if (!context) {
    throw new Error("useTherapist must be used within a TherapistProvider");
  }
  return context;
}
