import React from "react";

const TwoColumnLayout = ({ leftColumn, rightColumn }) => (
  <div className="flex flex-col justify-between  md:flex-row md:justify-between">
    <div className="md:w-2/5 w-full">{leftColumn}</div>
    <div className="md:w-2/5 w-full min-h-screen">{rightColumn}</div>
  </div>
);

export default TwoColumnLayout;
