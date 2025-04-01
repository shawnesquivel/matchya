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
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-3 font-medium">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {starterPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handlePromptClick(prompt)}
            disabled={isSendingChat}
            className="text-sm bg-white hover:bg-blue-50 px-4 py-2 rounded-full text-blue-600 border border-blue-200 
            transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-blue-300 transform hover:-translate-y-[2px]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
