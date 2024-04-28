"use client";
import { useState, useEffect } from "react";
import {
  generateUniqueID,
  getChatID,
  setCookiesChatId,
  clearChatIDCookie,
} from "../utils/chatHelpers";

const useChatSession = () => {
  const [chatId, setChatId] = useState(getChatID());

  useEffect(() => {
    // If no chat ID is present at component mount, generate a new one
    if (!chatId) {
      const newChatId = generateUniqueID();
      setCookiesChatId(newChatId);
      setChatId(newChatId);
    }
  }, [chatId]);

  const clearChatSession = () => {
    clearChatIDCookie(); // Clear the chat ID from cookies
    setChatId(null); // Reset chatId state
  };

  // Function to refresh or create a new chat session if needed
  const refreshChatSession = () => {
    const newChatId = generateUniqueID();
    setCookiesChatId(newChatId);
    setChatId(newChatId);
  };

  return { chatId, clearChatSession, refreshChatSession };
};

export default useChatSession;
