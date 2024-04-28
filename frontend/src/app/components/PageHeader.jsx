import React from "react";
import { pressStart2P, instrumentSans } from "../styles/fonts";

const PageHeader = ({ heading, boldText, description }) => {
  return (
    <>
      <h1 className={`${pressStart2P.className} mb-10 text-6xl uppercase`}>
        {heading}
      </h1>
      <p className={`${instrumentSans.className} mb-2`}>
        <strong>{boldText}</strong>
      </p>{" "}
      <p className={`${instrumentSans.className} mb-10`}>{description}</p>
    </>
  );
};

export default PageHeader;
