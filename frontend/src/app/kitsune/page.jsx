"use client";
import React from "react";
import Chatbot from "../layouts/Chatbot";

const Kitsune = () => {
  /**
   * Phase 1: Chatbot
   */
  return (
    <Chatbot
      emoji="🦊"
      headingText="Chapter 1"
      heading="Kitsune AI"
      boldText="Phase 1: Fully Customizable Chatbot"
      description="Generative Text. Prompt Engineering. Few Shot Learning."
      debug={false}
      // baseUrl="http://127.0.0.1:8000"
      // baseUrl="https://dm9k979b9h.execute-api.us-west-2.amazonaws.com/api"
      baseUrl="https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api"
      botPngFile="girlfriend"
    />
  );
};

export default Kitsune;
