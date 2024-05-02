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
      /** Base URL when using `chalice local` */
      baseUrl="http://127.0.0.1:8000"
      /** Base URL after using `chalice deploy` */
      // baseUrl="https://dm9k979b9h.execute-api.us-west-2.amazonaws.com/api"
      /** Base URL for tutorial  */
      // baseUrl="https://jk88xtfj1j.execute-api.us-west-2.amazonaws.com/api"
      botPngFile="girlfriend"
    />
  );
};

export default Kitsune;
