import React from "react";

const Title = ({ emoji, headingText }) => {
  /**
   * Displays text.
   */
  return (
    <>
      {/* <p className="text-center mb-4 text-2xl">{emoji}</p> */}
      <div className="py-4">      
        <a href="#">
          <img className="w-fit h-10" src="/assets/images/matchyalogo.png" alt="" />
        </a>
      </div>

      {/* <p className="text-center mb-8">{headingText.toUpperCase()}</p> */}
    </>
  );
};

export default Title;
