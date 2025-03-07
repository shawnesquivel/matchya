import React from "react";

const ChatbotQuestionnaireLink = () => {
  return (
    <a
      href="/questionnaire"
      className="flex items-center gap-2 text-grey-extraDark hover:-translate-x-1 transition-transform"
    >
      <svg
        width="9"
        height="8"
        viewBox="0 0 9 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.646447 3.42281C0.451184 3.61808 0.451184 3.93466 0.646447 4.12992L3.82843 7.3119C4.02369 7.50716 4.34027 7.50716 4.53553 7.3119C4.7308 7.11664 4.7308 6.80006 4.53553 6.60479L1.70711 3.77637L4.53553 0.94794C4.7308 0.752678 4.7308 0.436095 4.53553 0.240833C4.34027 0.0455707 4.02369 0.0455707 3.82843 0.240833L0.646447 3.42281ZM9 3.27637L1 3.27637L1 4.27637L9 4.27637L9 3.27637Z"
          fill="#878787"
        />
      </svg>
      <span>Don't know what you're looking for? Take our questionnaire</span>
    </a>
  );
};

export default ChatbotQuestionnaireLink;
