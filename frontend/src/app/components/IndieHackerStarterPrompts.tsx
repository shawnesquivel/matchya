import React from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

const starterPrompts = [
  "who's building AI tools?",
  "who's building edtech?",
  "who's building social media tools?",
];

export default function IndieHackerStarterPrompts() {
  const { chatSearch, isSendingChat } = useIndieHacker();

  const handlePromptClick = (prompt: string) => {
    if (!isSendingChat) {
      chatSearch(prompt);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <p className="text-sm text-gray-500 mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {starterPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handlePromptClick(prompt)}
            disabled={isSendingChat}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
