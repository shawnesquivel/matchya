import React from "react";

const Title = ({ emoji, headingText }) => {
  return (
    <>
      <p className="text-center mb-4 text-2xl">{emoji}</p>
      <p className="text-center mb-8">{headingText.toUpperCase()}</p>
    </>
  );
};

export default Title;
