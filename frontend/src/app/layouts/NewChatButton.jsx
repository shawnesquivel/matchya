import React from "react";

const NewChatButton = ({ handleClearChat }) => {
  return (
    <div className=" flex flex-col justify-end items-end">
      <button
        onClick={handleClearChat}
        className="bg-gray-400 hover:bg-gray-700 text-white text-xs py-2 px-4 rounded mb-4 w-1/7"
      >
        New Chat
      </button>
    </div>
  );
};

export default NewChatButton;
