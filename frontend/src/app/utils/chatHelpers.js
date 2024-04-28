/**
 * Helper functions for the Chatbot.
 */

export const generateUniqueID = () => {
  // Example: Generate a simple random ID. Consider using a more robust approach for production.
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const getChatID = () => {
  // Ensure this runs in the browser where 'document' is defined
  if (typeof window !== "undefined") {
    // Retrieves the chat ID from the cookies

    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("chatId="))
      ?.split("=")[1];
  }
  // Return undefined or a default value if not running in the browser
  return undefined;
};

export const setCookiesChatId = (id) => {
  // Sets the chat ID in the cookies
  document.cookie = `chatId=${id}; path=/; max-age=86400`; // Expires in 1 day
};

export const generateTimeStamp = () => {
  // Get the current time stamp formatted as Epoch (number)
  return Math.floor(new Date().getTime() / 1000);
};

export const clearChatIDCookie = () => {
  // Set the cookie to expire in the past, effectively deleting it
  document.cookie = "chatId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};
