import React from "react";

const NewChatButton = ({ handleClearChat }) => {
  /**
   *  Allows users to clear the chat messages / create a new chat ID.
   */
  return (
    <div className=" flex flex-col justify-end items-end">
      <button
        onClick={handleClearChat}
        className="bg-orange hover:bg-orange-dark text-white text-xs py-2 px-4 rounded-full w-1/7"
      >
        Reset Chat
      </button>
    </div>
  );
};

export default NewChatButton;
