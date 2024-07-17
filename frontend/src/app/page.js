"use client";
import React from "react";
import ChatbotWithoutForm from "./layouts/ChatbotWithoutForm";

const Kitsune = () => {
  return (
    <>
      <ChatbotWithoutForm
        description="simply let matchya know what kind of therapist you're looking for."
        debug={false}
        botPngFile="matchya"
      />
    </>
  );
};

export default Kitsune;
