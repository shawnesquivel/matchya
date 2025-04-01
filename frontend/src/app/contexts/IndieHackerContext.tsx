"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { generateUniqueID } from "../utils/chatHelpers";

// Define founder interface
export interface Founder {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  x_link: string;
  raw_product_links: string;
  total_estimated_mrr: number;
  llm_founder_summary: string;
  perplexity_analysis: string;
  similarity: number;
}

// Define message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
  isTyping?: boolean;
}

// Define filter interface
interface FounderFilters {
  minMrr: number | null;
  maxMrr: number | null;
}

// Define state interface
interface IndieHackerState {
  chatId: string;
  messages: Message[];
  founders: Founder[];
  filters: FounderFilters;
  isLoading: boolean;
  isSendingChat: boolean;
  error: string | null;
}

// Define action types
const ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_SENDING_CHAT: "SET_SENDING_CHAT",
  SET_ERROR: "SET_ERROR",
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_MESSAGES: "SET_MESSAGES",
  SET_FOUNDERS: "SET_FOUNDERS",
  RESET_CHAT: "RESET_CHAT",
  UPDATE_FILTERS: "UPDATE_FILTERS",
  REMOVE_TYPING_MESSAGE: "REMOVE_TYPING_MESSAGE",
};

// Initial state
const initialState: IndieHackerState = {
  chatId: generateUniqueID(),
  messages: [],
  founders: [],
  filters: {
    minMrr: null,
    maxMrr: null,
  },
  isLoading: false,
  isSendingChat: false,
  error: null,
};

// Reducer function
function indieHackerReducer(state: IndieHackerState, action: any): IndieHackerState {
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

    case ACTIONS.SET_FOUNDERS:
      return { ...state, founders: action.payload };

    case ACTIONS.RESET_CHAT:
      return {
        ...initialState,
        chatId: generateUniqueID(),
      };

    case ACTIONS.UPDATE_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case ACTIONS.REMOVE_TYPING_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    default:
      return state;
  }
}

// Create context
const IndieHackerContext = createContext<any>(null);

// Provider component
export function IndieHackerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(indieHackerReducer, initialState);

  // Add welcome message
  useEffect(() => {
    if (state.messages.length === 0) {
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: {
          role: "assistant",
          content: "Hi! I'm your indie hacker assistant. Ask me about founders and their products!",
          id: "welcome",
        },
      });
    }
  }, [state.messages.length]);

  // Add a message
  const addMessage = (message: Message) => {
    dispatch({ type: ACTIONS.ADD_MESSAGE, payload: message });
  };

  // Reset chat
  const resetChat = () => {
    dispatch({ type: ACTIONS.RESET_CHAT });
  };

  // Chat search function
  const chatSearch = async (message: string) => {
    try {
      dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: true });

      // Add user message to state immediately
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: {
          role: "user",
          content: message,
          id: Date.now().toString(),
        },
      });

      // Add typing indicator
      const typingMessageId = `typing-${Date.now()}`;
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: {
          role: "assistant",
          content: "",
          id: typingMessageId,
          isTyping: true,
        },
      });

      // Generate embedding and search
      const searchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ih_match_founders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            query: message,
            minMrr: state.filters.minMrr,
            maxMrr: state.filters.maxMrr,
          }),
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      // Update founders list
      dispatch({
        type: ACTIONS.SET_FOUNDERS,
        payload: searchData.founders || [],
      });

      // Generate chat response
      const chatResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ih_chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...state.messages.filter((msg: Message) => !msg.isTyping && msg.id !== "welcome"),
              { role: "user", content: message },
            ],
            matchedFounders: searchData.founders || [],
            chatId: state.chatId,
          }),
        }
      );

      if (!chatResponse.ok) {
        throw new Error(`Chat failed: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();

      // Remove typing indicator
      dispatch({
        type: ACTIONS.REMOVE_TYPING_MESSAGE,
        payload: typingMessageId,
      });

      // Add assistant response
      dispatch({
        type: ACTIONS.ADD_MESSAGE,
        payload: {
          role: "assistant",
          content: chatData.message,
          id: `response-${Date.now()}`,
        },
      });
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error instanceof Error ? error.message : "Unknown error",
      });

      // Remove typing indicator if there is an error
      const typingMessage = state.messages.find((msg: Message) => msg.isTyping);
      if (typingMessage?.id) {
        dispatch({
          type: ACTIONS.REMOVE_TYPING_MESSAGE,
          payload: typingMessage.id,
        });
      }
    } finally {
      dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: false });
    }
  };

  // Update filters
  const updateFilters = (filters: Partial<FounderFilters>) => {
    dispatch({ type: ACTIONS.UPDATE_FILTERS, payload: filters });
  };

  return (
    <IndieHackerContext.Provider
      value={{
        ...state,
        addMessage,
        resetChat,
        chatSearch,
        updateFilters,
      }}
    >
      {children}
    </IndieHackerContext.Provider>
  );
}

// Custom hook for using the context
export function useIndieHacker() {
  const context = useContext(IndieHackerContext);
  if (!context) {
    throw new Error("useIndieHacker must be used within an IndieHackerProvider");
  }
  return context;
}
