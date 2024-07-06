import React from "react";

const TwoColumnLayout = ({ leftColumn, rightColumn }) => (
  /**
   *  Splits the page into two columns.
   */
  <div className="flex justify-between flex-row md:justify-between content-center">
    <div className="md:w-2/5 w-full my-auto">{leftColumn}</div>
    <div className="md:w-2/5 w-full my-auto">{rightColumn}</div>
  </div>
);

export default TwoColumnLayout;
