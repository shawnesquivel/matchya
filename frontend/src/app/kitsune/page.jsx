"use client";
import React from "react";
import Chatbot from "../layouts/Chatbot";
const Kitsune = () => {
  /**
   * Phase 1: Chatbot
   */
  return (
    <>
      <Chatbot
        emoji="🦊"
        headingText="Chapter 1"
        heading="Kitsune AI"
        boldText="Phase 1: Fully Customizable Chatbot"
        description="Generative Text. Prompt Engineering. Few Shot Learning."
        debug={true}
        /** Base URL when using `chalice local` */
        baseUrl="http://localhost:8000"
        // baseUrl="https://lg9eg36d44.execute-api.us-west-2.amazonaws.com/api"
        botPngFile="girlfriend"
      />
    </>
  );
};

export default Kitsune;
