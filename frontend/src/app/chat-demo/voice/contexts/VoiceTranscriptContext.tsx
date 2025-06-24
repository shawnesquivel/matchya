"use client";

import React, { createContext, useContext, useState, FC, PropsWithChildren } from "react";
import { v4 as uuidv4 } from "uuid";
import { TranscriptItem } from "../../voice/types";

type VoiceTranscriptContextValue = {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (
    itemId: string,
    role: "user" | "assistant",
    text: string,
    isHidden?: boolean
  ) => void;
  updateTranscriptMessage: (itemId: string, text: string, isDelta: boolean) => void;
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
  updateTranscriptItem: (itemId: string, updatedProperties: Partial<TranscriptItem>) => void;
};

const VoiceTranscriptContext = createContext<VoiceTranscriptContextValue | undefined>(undefined);

export const VoiceTranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  function newTimestampPretty(): string {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    return `${time}.${ms}`;
  }

  const addTranscriptMessage: VoiceTranscriptContextValue["addTranscriptMessage"] = (
    itemId,
    role,
    text = "",
    isHidden = false
  ) => {
    setTranscriptItems((prev) => {
      if (prev.some((log) => log.itemId === itemId && log.type === "MESSAGE")) {
        console.warn(
          `[addTranscriptMessage] skipping; message already exists for itemId=${itemId}, role=${role}, text=${text}`
        );
        return prev;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: "MESSAGE",
        role,
        title: text,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
        isHidden,
      };

      return [...prev, newItem];
    });
  };

  const updateTranscriptMessage: VoiceTranscriptContextValue["updateTranscriptMessage"] = (
    itemId,
    newText,
    append = false
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId && item.type === "MESSAGE") {
          return {
            ...item,
            title: append ? (item.title ?? "") + newText : newText,
          };
        }
        return item;
      })
    );
  };

  const addTranscriptBreadcrumb: VoiceTranscriptContextValue["addTranscriptBreadcrumb"] = (
    title,
    data
  ) => {
    setTranscriptItems((prev) => [
      ...prev,
      {
        itemId: `breadcrumb-${uuidv4()}`,
        type: "BREADCRUMB",
        title,
        data,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: "DONE",
        isHidden: false,
      },
    ]);
  };

  const toggleTranscriptItemExpand: VoiceTranscriptContextValue["toggleTranscriptItemExpand"] = (
    itemId
  ) => {
    setTranscriptItems((prev) =>
      prev.map((log) => (log.itemId === itemId ? { ...log, expanded: !log.expanded } : log))
    );
  };

  const updateTranscriptItem: VoiceTranscriptContextValue["updateTranscriptItem"] = (
    itemId,
    updatedProperties
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, ...updatedProperties } : item))
    );
  };

  return (
    <VoiceTranscriptContext.Provider
      value={{
        transcriptItems,
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItem,
      }}
    >
      {children}
    </VoiceTranscriptContext.Provider>
  );
};

export function useVoiceTranscript() {
  const context = useContext(VoiceTranscriptContext);
  if (!context) {
    throw new Error("useVoiceTranscript must be used within a VoiceTranscriptProvider");
  }
  return context;
}
