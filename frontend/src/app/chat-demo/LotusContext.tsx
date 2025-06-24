"use client";
import React, { createContext, useContext, useReducer, useEffect } from "react";

// Types
export interface LotusMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  reasoning?: any; // Debug info from LLM
}

export interface LotusSessionState {
  sessionId: string;
  therapyType: string; // Selected therapy type (cbt, ifs, dbt, emdr)
  stage: number; // 1-5 (Warmup → Complete)
  messages: LotusMessage[];
  isComplete: boolean;
  voiceMode: boolean;
}

// Stage names mapping
export const STAGE_NAMES = {
  1: "Warmup",
  2: "Exploration",
  3: "Reframe",
  4: "Summary",
  5: "Complete",
};

// Stage descriptions for user understanding
export const STAGE_DESCRIPTIONS = {
  1: "Building connection and understanding your current feelings",
  2: "Exploring the specific challenges and patterns",
  3: "Finding new perspectives and coping strategies",
  4: "Summarizing insights and creating an action plan",
  5: "Session complete - well done!",
};

// Actions
type LotusAction =
  | { type: "ADD_MESSAGE"; payload: LotusMessage }
  | { type: "UPDATE_STAGE"; payload: number }
  | { type: "SET_COMPLETE"; payload: boolean }
  | { type: "SET_THERAPY_TYPE"; payload: string }
  | { type: "SET_VOICE_MODE"; payload: boolean }
  | { type: "RESET_SESSION" }
  | { type: "LOAD_SESSION"; payload: LotusSessionState };

// Generate session ID
const generateSessionId = () => {
  return `lotus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Initial state
const createInitialState = (): LotusSessionState => ({
  sessionId: generateSessionId(),
  therapyType: "", // Empty until selected
  stage: 1,
  messages: [],
  isComplete: false,
  voiceMode: false,
});

// Reducer
const lotusReducer = (state: LotusSessionState, action: LotusAction): LotusSessionState => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "UPDATE_STAGE":
      return {
        ...state,
        stage: action.payload,
        isComplete: action.payload === 5,
      };
    case "SET_COMPLETE":
      return {
        ...state,
        isComplete: action.payload,
      };
    case "SET_THERAPY_TYPE":
      return {
        ...state,
        therapyType: action.payload,
      };
    case "SET_VOICE_MODE":
      return {
        ...state,
        voiceMode: action.payload,
      };
    case "RESET_SESSION":
      return createInitialState();
    case "LOAD_SESSION":
      return action.payload;
    default:
      return state;
  }
};

// Context
interface LotusContextType {
  state: LotusSessionState;
  addMessage: (message: Omit<LotusMessage, "id" | "timestamp">) => void;
  updateStage: (stage: number) => void;
  setComplete: (complete: boolean) => void;
  setTherapyType: (therapyType: string) => void;
  setVoiceMode: (voiceMode: boolean) => void;
  resetSession: () => void;
  getCurrentStageName: () => string;
}

const LotusContext = createContext<LotusContextType | undefined>(undefined);

// Provider
export function LotusProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lotusReducer, createInitialState());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lotus-session");
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        dispatch({ type: "LOAD_SESSION", payload: parsedState });
      } catch (error) {
        console.error("Failed to load session from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem("lotus-session", JSON.stringify(state));
  }, [state]);

  const addMessage = (message: Omit<LotusMessage, "id" | "timestamp">) => {
    const fullMessage: LotusMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_MESSAGE", payload: fullMessage });
  };

  const updateStage = (stage: number) => {
    dispatch({ type: "UPDATE_STAGE", payload: stage });
  };

  const setComplete = (complete: boolean) => {
    dispatch({ type: "SET_COMPLETE", payload: complete });
  };

  const setTherapyType = (therapyType: string) => {
    dispatch({ type: "SET_THERAPY_TYPE", payload: therapyType });
  };

  const setVoiceMode = (voiceMode: boolean) => {
    dispatch({ type: "SET_VOICE_MODE", payload: voiceMode });
  };

  const resetSession = () => {
    localStorage.removeItem("lotus-session");
    dispatch({ type: "RESET_SESSION" });
  };

  const getCurrentStageName = () => {
    return STAGE_NAMES[state.stage as keyof typeof STAGE_NAMES] || "Unknown";
  };

  return (
    <LotusContext.Provider
      value={{
        state,
        addMessage,
        updateStage,
        setComplete,
        setTherapyType,
        setVoiceMode,
        resetSession,
        getCurrentStageName,
      }}
    >
      {children}
    </LotusContext.Provider>
  );
}

// Hook
export function useLotus() {
  const context = useContext(LotusContext);
  if (context === undefined) {
    throw new Error("useLotus must be used within a LotusProvider");
  }
  return context;
}
