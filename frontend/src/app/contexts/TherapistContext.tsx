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
};

// Reducer function
function therapistReducer(state, action) {
  console.log("[Context Reducer]", action.type, action.payload);

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

    case ACTIONS.SET_THERAPISTS:
      return { ...state, therapists: action.payload };

    case ACTIONS.RESET_CHAT:
      return {
        ...initialState,
        chatId: action.payload?.chatId || crypto.randomUUID(),
        requestCount: state.requestCount,
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
          { role: "user", content: action.payload },
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
        const formattedMessages = data.messages.map((msg) => ({
          role: msg.source === "USER" ? "user" : "assistant",
          content: msg.message,
          id: msg.id.toString(),
        }));

        dispatch({ type: ACTIONS.SET_MESSAGES, payload: formattedMessages });
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: "Failed to load chat history",
      });
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
        // Add user message to state immediately
        dispatch({
          type: ACTIONS.ADD_USER_MESSAGE,
          payload: update.message,
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
                ...state.messages,
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
                ...state.messages,
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
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_STATE, payload: false });
    }
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
