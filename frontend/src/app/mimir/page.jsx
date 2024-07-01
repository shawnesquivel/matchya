"use client";
import React from "react";
import ChatbotWithoutForm from "../layouts/ChatbotWithoutForm";
const Kitsune = () => {
  /**
   * Phase 1: ChatbotWithoutForm
   */
  return (
    <>
      <ChatbotWithoutForm
        emoji="🍵"
        headingText="matchya"
        heading="matchya"
        boldText="find your perfect therapist."
        description="simply let matchya know what kind of therapist you're looking for."
        debug={false}
        /** Base URL when using `chalice local` */
        baseUrl="https://smvfn4yz5a.execute-api.us-west-2.amazonaws.com/api"
        // baseUrl="http://127.0.0.1:8000"
        botPngFile="wizard"
      />
    </>
  );
};

export default Kitsune;
