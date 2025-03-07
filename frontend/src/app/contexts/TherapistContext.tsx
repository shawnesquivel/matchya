"use client";
import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  approaches: {
    long_term: string[];
    short_term?: string[];
  };
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
  // Chat state
  chatId: crypto.randomUUID(),
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
};

// Create context
const TherapistContext = createContext(null);

// Action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  UPDATE_FILTERS: "UPDATE_FILTERS",
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

    case ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

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
        chatId: crypto.randomUUID(),
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
        useMockData: action.payload !== undefined ? action.payload : !state.useMockData,
      };

    default:
      return state;
  }
}

// Provider component
export function TherapistProvider({ children }) {
  const [state, dispatch] = useReducer(therapistReducer, initialState);
  const supabase = createClientComponentClient();

  // Simplify the updateFilters function
  const updateFilters = (newFilters: Partial<TherapistFilters>) => {
    console.log("[Context] Updating filters:", newFilters);

    // Just dispatch the update directly
    dispatch({
      type: ACTIONS.UPDATE_FILTERS,
      payload: {
        ...state.filters,
        ...newFilters,
      },
    });
  };

  // Function to add a message
  const addMessage = (message) => {
    // FLOW STEP 2: When a chat message is sent, it's added to the messages array
    console.log("[Context] Adding message:", message);
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  };

  // Function to set error
  const setError = (error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };

  // Function to reset chat
  const resetChat = () => {
    dispatch({ type: ACTIONS.RESET_CHAT });
  };

  // Function to generate embeddings
  const generateEmbedding = async (text) => {
    try {
      const response = await fetch("/api/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate embedding");
      }

      return await response.json();
    } catch (error) {
      console.error("Embedding error:", error);
      setError(error.toString());
      return null;
    }
  };

  // Function to handle chat submission
  const handleChatSubmission = async (text) => {
    try {
      console.log("[Context] 🚀 Starting chat submission");

      // Immediately disable form and set loading states
      dispatch({ type: ACTIONS.SET_FORM_DISABLED, payload: true });
      dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: true });
      dispatch({ type: ACTIONS.SET_THERAPIST_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_CHAT_LOADING, payload: true });

      // Add user message immediately
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage });
      console.log("[Context] ✅ Added user message to state");

      // STEP 1: Call therapist-matches to get related therapists
      console.log("[Context] 🔍 Calling therapist-matches API");

      const responseBody = JSON.stringify({
        currentFilters: state.filters,
        triggerSource: "CHAT",
        messages: state.messages,
        lastUserMessage: text,
        filterOnly: false,
      });

      console.log(
        "[Context.handleChatSubmission]: messages",
        state.messages,
        typeof state.messages,
        "body",
        responseBody
      );

      const matchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: responseBody,
        }
      );

      if (!matchResponse.ok) {
        throw new Error(
          `Failed to get therapist matches: ${matchResponse.status} ${matchResponse.statusText}`
        );
      }

      const matchData = await matchResponse.json();
      console.log("[Context] ✅ Received therapist matches:", matchData.therapists?.length || 0);

      // Update therapist results and filters
      if (matchData.therapists && Array.isArray(matchData.therapists)) {
        if (matchData.extractedFilters) {
          console.log("[Context] 📊 Setting combined therapists and filters");
          dispatch({
            type: ACTIONS.SET_FILTERS_AND_THERAPISTS,
            payload: {
              therapists: matchData.therapists,
              filters: matchData.extractedFilters,
            },
          });
        } else {
          console.log("[Context] 📊 Setting only therapists");
          dispatch({
            type: ACTIONS.SET_THERAPISTS,
            payload: matchData.therapists,
          });
        }
      }

      // Mark therapist loading as complete, but keep form disabled
      dispatch({ type: ACTIONS.SET_THERAPIST_LOADING, payload: false });
      console.log("[Context] ✅ Therapist loading complete, form still disabled");

      // STEP 2: Call chat-v3 to get AI response
      console.log("[Context] 💬 Calling chat-v3 API");
      const chatResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-v3`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            chatId: null, // We're not using persistent chats yet
            messages: [...state.messages, userMessage],
            matchedTherapists: matchData.therapists || [],
          }),
        }
      );

      if (!chatResponse.ok) {
        throw new Error(
          `Failed to get chat response: ${chatResponse.status} ${chatResponse.statusText}`
        );
      }

      const chatData = await chatResponse.json();
      console.log("[Context] ✅ Received chat response");

      // Add assistant message
      if (chatData.message) {
        dispatch({
          type: ACTIONS.ADD_MESSAGE,
          payload: {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: chatData.message,
          },
        });
        console.log("[Context] ✅ Added assistant message to state");
      }

      // Update request stats
      dispatch({
        type: ACTIONS.SET_LAST_REQUEST_TIME,
        payload: new Date().toISOString(),
      });
      dispatch({ type: ACTIONS.INCREMENT_REQUEST_COUNT });

      return true;
    } catch (error) {
      console.error("[Context] ❌ Error in chat submission:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.toString() });
      return false;
    } finally {
      // Always clear all loading states when done
      console.log("[Context] 🏁 Chat submission complete, resetting all loading states");
      dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: false });
      dispatch({ type: ACTIONS.SET_CHAT_LOADING, payload: false });
      dispatch({ type: ACTIONS.SET_FORM_DISABLED, payload: false });
    }
  };

  // Function to fetch therapists based on current filters only
  const fetchFilteredTherapists = async () => {
    try {
      console.log("[Context] 🔍 Starting therapist filtering");

      // Set loading state
      dispatch({ type: ACTIONS.SET_THERAPIST_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_FORM_DISABLED, payload: true });

      console.log("[Context] 📊 Fetching therapists with filters:", state.filters);

      // Call the API
      console.log("therapist-matches using", process.env.NEXT_PUBLIC_SUPABASE_URL);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            currentFilters: state.filters,
            triggerSource: "FORM",
            filterOnly: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch therapists: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[Context] ✅ Received therapists:", data.therapists?.length || 0);

      if (data.therapists && Array.isArray(data.therapists)) {
        dispatch({ type: ACTIONS.SET_THERAPISTS, payload: data.therapists });
      } else {
        console.warn("[Context] ⚠️ No therapists in response or invalid format");
        dispatch({ type: ACTIONS.SET_THERAPISTS, payload: [] });
      }

      // Update request stats
      dispatch({
        type: ACTIONS.SET_LAST_REQUEST_TIME,
        payload: new Date().toISOString(),
      });
      dispatch({ type: ACTIONS.INCREMENT_REQUEST_COUNT });

      return true;
    } catch (error) {
      console.error("[Context] ❌ Error fetching therapists:", error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.toString() });
      return false;
    } finally {
      // Always clear loading states when done
      console.log("[Context] 🏁 Therapist filtering complete, resetting loading states");
      dispatch({ type: ACTIONS.SET_THERAPIST_LOADING, payload: false });
      dispatch({ type: ACTIONS.SET_FORM_DISABLED, payload: false });
    }
  };

  // Function to toggle mock data mode
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

  // Make sure the filters useEffect doesn't run unnecessarily
  useEffect(() => {
    // Skip if we're in the middle of setting up initial state
    if (state.isLoading) {
      return;
    }

    // Skip if filters are at initial state (empty)
    const isInitialState = Object.values(state.filters).every(
      (value) => value === null || (Array.isArray(value) && value.length === 0)
    );

    if (isInitialState && state.therapists.length === 0) {
      return;
    }

    console.log("[Context] Filters changed, updating results");
    fetchFilteredTherapists();
  }, [state.filters]);

  // Normalize message format
  const normalizeMessage = (msg) => ({
    role: msg.role,
    content: msg.content || (msg.parts?.[0]?.text ?? null),
  });

  return (
    <TherapistContext.Provider
      value={{
        ...state,
        updateFilters,
        addMessage,
        resetChat,
        handleChatSubmission,
        fetchFilteredTherapists,
        normalizeMessage,
        isTherapistLoading: state.isTherapistLoading,
        isChatLoading: state.isChatLoading,
        isFormDisabled: state.isFormDisabled,
        useMockData: state.useMockData,
        toggleMockData,
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
