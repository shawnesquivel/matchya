"use client";

import React, { createContext, useContext, useState, FC, PropsWithChildren } from "react";
import { v4 as uuidv4 } from "uuid";
import { LoggedEvent } from "../../voice/types";

type VoiceEventContextValue = {
  loggedEvents: LoggedEvent[];
  logClientEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  logServerEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  logHistoryItem: (item: any) => void;
  toggleExpand: (id: number | string) => void;
};

const VoiceEventContext = createContext<VoiceEventContextValue | undefined>(undefined);

export const VoiceEventProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  function addLoggedEvent(
    direction: "client" | "server",
    eventName: string,
    eventData: Record<string, any>
  ) {
    const id = eventData.event_id || uuidv4();
    setLoggedEvents((prev) => [
      ...prev,
      {
        id,
        direction,
        eventName,
        eventData,
        timestamp: new Date().toLocaleTimeString(),
        expanded: false,
      },
    ]);
  }

  const logClientEvent: VoiceEventContextValue["logClientEvent"] = (
    eventObj,
    eventNameSuffix = ""
  ) => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("client", name, eventObj);
  };

  const logServerEvent: VoiceEventContextValue["logServerEvent"] = (
    eventObj,
    eventNameSuffix = ""
  ) => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("server", name, eventObj);
  };

  const logHistoryItem: VoiceEventContextValue["logHistoryItem"] = (item) => {
    let eventName = item.type;
    if (item.type === "message") {
      eventName = `${item.role}.${item.status}`;
    }
    if (item.type === "function_call") {
      eventName = `function.${item.name}.${item.status}`;
    }
    addLoggedEvent("server", eventName, item);
  };

  const toggleExpand: VoiceEventContextValue["toggleExpand"] = (id) => {
    setLoggedEvents((prev) =>
      prev.map((log) => {
        if (log.id === id) {
          return { ...log, expanded: !log.expanded };
        }
        return log;
      })
    );
  };

  return (
    <VoiceEventContext.Provider
      value={{ loggedEvents, logClientEvent, logServerEvent, logHistoryItem, toggleExpand }}
    >
      {children}
    </VoiceEventContext.Provider>
  );
};

export function useVoiceEvent() {
  const context = useContext(VoiceEventContext);
  if (!context) {
    throw new Error("useVoiceEvent must be used within a VoiceEventProvider");
  }
  return context;
}
