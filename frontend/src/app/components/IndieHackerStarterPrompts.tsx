import React from "react";
import { useIndieHacker } from "../contexts/IndieHackerContext";

const starterPrompts = [
  {
    text: "who's building AI tools?",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path>
        <path d="M12 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
        <path d="M20 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM4 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path>
        <path d="M20 20c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM4 20c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path>
        <path d="M5 19L19 5"></path>
      </svg>
    ),
  },
  {
    text: "who's building edtech?",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
        <path d="M16.5 9.4L7.55 4.24"></path>
        <polyline points="3.29 7 12 12 20.71 7"></polyline>
        <line x1="12" y1="22" x2="12" y2="12"></line>
        <circle cx="18.5" cy="15.5" r="2.5"></circle>
        <path d="M20.27 17.27L22 19"></path>
      </svg>
    ),
  },
  {
    text: "who's building social media tools?",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    ),
  },
];

export default function IndieHackerStarterPrompts() {
  const { chatSearch, isSendingChat } = useIndieHacker();

  const handlePromptClick = (prompt: string) => {
    if (!isSendingChat) {
      chatSearch(prompt);
    }
  };

  return (
    <div className="py-4 px-5 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-600 mb-3 font-medium flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Try asking:
        </p>
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt.text)}
              disabled={isSendingChat}
              className="group text-sm bg-white hover:bg-blue-50 pl-3 pr-4 py-2 rounded-full text-gray-700 border border-gray-200 
              transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed
              hover:border-blue-300 transform hover:-translate-y-[1px] hover:text-blue-700 flex items-center"
            >
              <span className="w-5 h-5 mr-2 flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-colors">
                {prompt.icon}
              </span>
              {prompt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
