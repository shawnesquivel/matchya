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
  clinic_city: string | null;
  clinic_province: string | null;
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
  slug?: string;
}

// Helper functions for localStorage persistence
const STORAGE_KEYS = {
  FILTERS: "matchya_filters",
  THERAPISTS: "matchya_therapists",
};

const WELCOME_CHATBOT_MSG =
  "Hi! I'm here to help you find the perfect therapist. \n\nTo start, just mention what you're going through, or what kind of therapist you're looking for. \n\nThe more you are comfortable sharing, the better I can match you with the right person. \n\nIf you run into any issues, just shoot us an email at hello@designwithshay.com";

// Save filters to localStorage
const saveFiltersToStorage = (filters: TherapistFilters) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("therapist_filters", JSON.stringify(filters));
  } catch (error) {
    console.error("[TherapistContext] Error saving filters to localStorage:", error);
  }
};

// Save therapists to localStorage
const saveTherapistsToStorage = (therapists: Therapist[]) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(therapists));
    }
  } catch (error) {
    console.error("[TherapistContext] Error saving therapists to localStorage:", error);
  }
};

// Load filters from localStorage
const loadFiltersFromStorage = (): TherapistFilters | null => {
  if (typeof window === "undefined") return null;
  try {
    const filters = localStorage.getItem("therapist_filters");
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      // Ensure location has a default if not present in storage
      if (!parsedFilters.clinic_city) {
        parsedFilters.clinic_city = "Vancouver";
      }
      if (!parsedFilters.clinic_province) {
        parsedFilters.clinic_province = "BC";
      }
      return parsedFilters;
    }
  } catch (error) {
    console.error("Error loading filters from local storage", error);
  }
  return null;
};

// Load therapists from localStorage
const loadTherapistsFromStorage = (): Therapist[] | null => {
  try {
    if (typeof window !== "undefined") {
      const savedTherapists = localStorage.getItem(STORAGE_KEYS.THERAPISTS);
      if (savedTherapists) {
        return JSON.parse(savedTherapists);
      }
    }
    return null;
  } catch (error) {
    console.error("[TherapistContext] Error loading therapists from localStorage:", error);
    return null;
  }
};

// Default state without localStorage access to prevent hydration errors
const defaultFilters = {
  gender: null,
  sexuality: null,
  ethnicity: null,
  faith: null,
  max_price_initial: null,
  max_price_subsequent: null,
  availability: null,
  format: null,
  clinic_city: "Vancouver",
  clinic_province: "BC",
};

// Initial state without accessing localStorage - this avoids hydration errors
const initialState = {
  // Chat state - use getChatID() first, fallback to UUID
  chatId: getChatID() || crypto.randomUUID(),
  messages: [],

  // Filter state (matching database schema) - default state for SSR
  filters: defaultFilters,

  // UI state
  isLoading: false,
  isSendingChat: false,
  error: null,
  lastRequestTime: null,
  requestCount: 0,

  // Results - empty array for SSR
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

  // Flag to track if we've hydrated from localStorage yet
  isHydrated: false,
};

// Create context
const TherapistContext = createContext(null);

// New unified update types
type DirectFilterUpdate = {
  type: "DIRECT";
  filters: Partial<TherapistFilters>;
  skipSearch?: boolean; // Add flag to skip the therapist search
};

type ChatBasedUpdate = {
  type: "CHAT";
  message: string;
  isFollowUp?: boolean;
  preserveTherapists?: boolean;
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
  HYDRATE_FROM_STORAGE: "HYDRATE_FROM_STORAGE",
  UPDATE_FILTERS: "UPDATE_FILTERS",
};

// Reducer function with persistence hooks
function therapistReducer(state, action) {
  let newState;
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
      newState = { ...state, therapists: action.payload };
      // Persist therapists to localStorage
      saveTherapistsToStorage(action.payload);
      return newState;

    case ACTIONS.RESET_CHAT:
      // Note: We don't save the empty therapists array or default filters to localStorage here
      // because we're explicitly removing them in the resetChat function
      return {
        ...initialState,
        chatId: action.payload?.chatId || crypto.randomUUID(),
        requestCount: state.requestCount,
        messages: [], // Explicitly clear messages array
        followUpQuestions: [], // Clear follow-up questions on reset
        // Reset therapists and filters to defaults
        therapists: [], // Clear therapists list on New Chat
        filters: defaultFilters, // Reset filters to default values
        isHydrated: state.isHydrated, // Maintain hydration status
      };

    case ACTIONS.INCREMENT_REQUEST_COUNT:
      return {
        ...state,
        requestCount: state.requestCount + 1,
      };

    case ACTIONS.SET_FILTERS_AND_THERAPISTS:
      const newFilters = { ...state.filters, ...action.payload.filters };
      newState = {
        ...state,
        filters: newFilters,
        therapists: action.payload.therapists,
        skipFilterEffect: true,
      };
      // Persist filters and therapists to localStorage
      saveFiltersToStorage(newFilters);
      saveTherapistsToStorage(action.payload.therapists);
      return newState;

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

    case ACTIONS.UPDATE_CHAT_RESULTS:
      const chatFilters = { ...state.filters, ...action.payload.filters };
      newState = {
        ...state,
        therapists: action.payload.therapists,
        filters: chatFilters,
      };
      // Persist filters and therapists to localStorage
      saveFiltersToStorage(chatFilters);
      saveTherapistsToStorage(action.payload.therapists);
      return newState;

    case ACTIONS.UPDATE_FILTER_RESULTS:
      newState = {
        ...state,
        therapists: action.payload.therapists,
        filters: action.payload.filters,
      };
      // Persist filters and therapists to localStorage
      saveFiltersToStorage(action.payload.filters);
      saveTherapistsToStorage(action.payload.therapists);
      return newState;

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

    // Add a new action type for hydration from localStorage
    case ACTIONS.HYDRATE_FROM_STORAGE:
      return {
        ...state,
        filters: action.payload.filters || state.filters,
        therapists: action.payload.therapists || state.therapists,
        isHydrated: true,
      };

    case ACTIONS.UPDATE_FILTERS:
      const updatedFilters = {
        ...state.filters,
        ...action.payload,
      };
      console.log("Reducer - UPDATE_FILTERS:", updatedFilters);
      saveFiltersToStorage(updatedFilters);
      return {
        ...state,
        filters: updatedFilters,
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

    // Only attempt to load chat history in production
    if (process.env.NODE_ENV === "production" && state.chatId) {
      loadChatHistory(state.chatId);
    } else {
      // In development, just set loading to false and let welcome message show
      dispatch({ type: ACTIONS.SET_LOADING_HISTORY, payload: false });
      dispatch({ type: ACTIONS.SET_MESSAGES, payload: [] });
    }

    // Only run client-side localStorage hydration once after mounting
    if (typeof window !== "undefined" && !state.isHydrated) {
      // Safely load data from localStorage after mount (client-side only)
      try {
        // Get filters and therapists from localStorage
        const savedFilters = loadFiltersFromStorage();
        const savedTherapists = loadTherapistsFromStorage();

        // Dispatch a single hydration action with both values
        dispatch({
          type: ACTIONS.HYDRATE_FROM_STORAGE,
          payload: {
            filters: savedFilters || defaultFilters,
            therapists: savedTherapists || [],
          },
        });
      } catch (error) {
        console.error("[TherapistProvider] Error hydrating from localStorage:", error);
      }
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
          content: WELCOME_CHATBOT_MSG,
          isWelcomeMessage: true, // Flag to identify this as a welcome message
        },
      });
    }
  }, [state.isLoadingHistory, state.messages.length]);

  // Add loadChatHistory function
  const loadChatHistory = async (chatId) => {
    // Skip chat history loading in development
    if (process.env.NODE_ENV !== "production") {
      console.log("[TherapistContext] Skipping chat history load in development");
      dispatch({ type: ACTIONS.SET_LOADING_HISTORY, payload: false });
      dispatch({ type: ACTIONS.SET_MESSAGES, payload: [] });
      return;
    }

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
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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

    // Clear therapists and filters from localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.THERAPISTS);
        localStorage.removeItem(STORAGE_KEYS.FILTERS);
        console.log(
          "[TherapistContext] Cleared therapists and filters from localStorage during reset"
        );
      } catch (error) {
        console.error("[TherapistContext] Error clearing data from localStorage:", error);
      }
    }

    // Clear therapists, reset filters, and reset chat
    dispatch({ type: ACTIONS.RESET_CHAT, payload: { chatId: newChatId } });

    // Add welcome message after reset
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: {
        role: "assistant",
        content: WELCOME_CHATBOT_MSG,
        isWelcomeMessage: true, // Flag to identify this as a welcome message
      },
    });
  };

  // Function to update location with smart comparison
  const updateLocation = async (
    newCity: string | null,
    newProvince: string | null
  ): Promise<boolean> => {
    // Get current location from state
    const currentCity = state.filters.clinic_city;
    const currentProvince = state.filters.clinic_province;

    // Check if location is changing
    const isLocationChanged = newCity !== currentCity || newProvince !== currentProvince;

    console.log(`[TherapistContext] Location comparison: 
      Current: ${currentCity}, ${currentProvince}
      New: ${newCity}, ${newProvince}
      Changed: ${isLocationChanged}`);

    if (isLocationChanged) {
      // If location is different, reset chat first
      console.log("[TherapistContext] Location changed, resetting chat and filters");
      resetChat();

      // Then update to new location (skip the therapist search for now)
      await updateTherapists({
        type: "DIRECT",
        filters: {
          clinic_city: newCity,
          clinic_province: newProvince,
        },
        skipSearch: true,
      });
    } else {
      // If location is the same, just make sure filters reflect the correct location
      console.log("[TherapistContext] Location unchanged, preserving chat and filters");
      await updateTherapists({
        type: "DIRECT",
        filters: {
          clinic_city: newCity,
          clinic_province: newProvince,
        },
        skipSearch: true,
      });
    }

    return isLocationChanged;
  };

  const deduplicateTherapists = (therapists: Therapist[]): Therapist[] => {
    if (!therapists || !therapists.length) return [];
    return Array.from(new Map(therapists.map((therapist) => [therapist.id, therapist])).values());
  };

  // New unified update function
  const updateTherapists = async (update: TherapistUpdate) => {
    /**
     *  Update the UI to reflect results from chat/filter components.
     */
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
              currentFilters: {
                ...state.filters,
                clinic_city: state.filters.clinic_city,
                clinic_province: state.filters.clinic_province,
              },
              triggerSource: "CHAT",
              lastUserMessage: update.message,
              filterOnly: false,
              isFollowUp: update.isFollowUp || false, // Pass the flag to the backend
            }),
          }
        );

        const matchData = await response.json();

        // Only update therapists if we have new therapists AND we're not preserving existing ones
        if (
          matchData.therapists &&
          Array.isArray(matchData.therapists) &&
          matchData.therapists.length > 0
        ) {
          const uniqueTherapists = deduplicateTherapists(matchData.therapists);
          dispatch({
            type: ACTIONS.UPDATE_CHAT_RESULTS,
            payload: {
              therapists: uniqueTherapists,
              filters: matchData.extractedFilters || {},
              message: update.message,
            },
          });
        } else if (!update.preserveTherapists) {
          // Only clear therapists if not a follow-up question
          console.log("No therapists returned and not preserving existing ones");
          dispatch({
            type: ACTIONS.UPDATE_CHAT_RESULTS,
            payload: {
              therapists: [],
              filters: matchData.extractedFilters || {},
              message: update.message,
            },
          });
        } else {
          console.log("Preserving existing therapists for follow-up question");
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
              isFollowUp: update.isFollowUp || false, // Pass flag to chat endpoint
            }),
          }
        );

        if (!chatResponse.ok) {
          throw new Error(`Failed to get chat response: ${chatResponse.status}`);
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
        // For follow-up questions, use the current therapists rather than potentially empty results
        const therapistsForFollowUps =
          update.preserveTherapists && matchData.therapists.length === 0
            ? state.therapists
            : matchData.therapists || [];

        await fetchFollowUpQuestions(update.message, therapistsForFollowUps);

        // Set isSendingChat back to false when chat response is received
        dispatch({ type: ACTIONS.SET_SENDING_CHAT, payload: false });
      } else {
        // Direct filter flow
        const mergedFilters = { ...state.filters, ...update.filters };

        // First, immediately update the filters in state
        dispatch({
          type: ACTIONS.UPDATE_FILTERS,
          payload: update.filters,
        });

        // Save filters to localStorage immediately
        saveFiltersToStorage(mergedFilters);

        // If skipSearch is true, don't make the API call for therapists
        if (update.skipSearch) {
          console.log("TherapistContext: Skipping therapist search - location only update");
          dispatch({ type: ACTIONS.SET_LOADING_STATE, payload: false });
          return;
        }

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
          `Failed to get follow-up questions: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.questions || !Array.isArray(data.questions)) {
        console.error("[fetchFollowUpQuestions] Invalid response format:", data);
        return;
      }
      if (data.questions && Array.isArray(data.questions)) {
        // Add unique IDs to the questions to track them
        const questionsWithIds = data.questions.map((q) => ({
          ...q,
          id: `followup-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // Replaced substr with slice
        }));

        dispatch({
          type: ACTIONS.SET_FOLLOW_UP_QUESTIONS,
          payload: questionsWithIds,
        });
      }
    } catch (error) {
      console.error("[fetchFollowUpQuestions] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING_FOLLOW_UPS, payload: false });
    }
  };

  // Add sendFollowUpQuestion function to handle when a user clicks a question
  const sendFollowUpQuestion = async (questionText, questionId) => {
    // Remove the question from the state
    const updatedQuestions = state.followUpQuestions.filter((q) => q.id !== questionId);
    dispatch({
      type: ACTIONS.SET_FOLLOW_UP_QUESTIONS,
      payload: updatedQuestions,
    });

    // Send the question as a user message
    await updateTherapists({
      type: "CHAT",
      message: questionText,
      isFollowUp: true, // Add flag to identify this as a follow-up question
      preserveTherapists: true, // Flag to preserve existing therapists
    });
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

  // Add a function to clear therapist results but keep chat history
  const clearResults = () => {
    // Clear therapists from localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEYS.THERAPISTS);
        console.log("[TherapistContext] Cleared therapists from localStorage");
      } catch (error) {
        console.error("[TherapistContext] Error clearing therapists from localStorage:", error);
      }
    }

    // Reset filters to default and clear therapist results
    dispatch({
      type: ACTIONS.UPDATE_FILTER_RESULTS,
      payload: {
        therapists: [], // Empty array = no results
        filters: defaultFilters, // Reset to default filters
      },
    });
  };

  return (
    <TherapistContext.Provider
      value={{
        ...state,
        addMessage,
        resetChat,
        updateTherapists,
        updateLocation,
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
        clearResults,
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
