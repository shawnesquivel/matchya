"use client";
import React, { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { aspekta } from "../styles/fonts";
import PrimaryBtn from "../components/PrimaryBtn";
import { UserButton } from "@clerk/clerk-react";

const SubmitBioForm = ({ user }) => {
  const [bioLink, setBioLink] = useState("");

  if (!user) return <SignIn />;

  const handleCreateProfile = async () => {
    if (!bioLink) {
      alert("Please enter a bio link.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/profile/scrape?bio_link=${encodeURIComponent(
          bioLink
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      console.log(data); // Handle the response data as needed
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div
      className={`md:h-screen bg-white gap-2 flex flex-col p-4 h-full ${aspekta.className} transition ease-in-out`}
      id="page-layout"
    >
      <div className="md:bg-grey px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 md:rounded-2xl h-full z-10 md:overflow-hidden relative flex items-center justify-center">
        <div className="lg:py-8 px-2 py-4 lg:px-20 md:px-10 flex flex-row md:justify-between lg:absolute w-full top-0 left-0">
          <img
            src="/assets/images/matchya-for-therapists.png"
            className="w-auto md:h-11 h-8"
            alt="matchya for therapists"
          />
          <div className="">
            <UserButton userProfileUrl="/profile" />
          </div>
        </div>

        <div className="text-center flex flex-col gap-4 items-center justify-center max-w-[800px]">
          <h1 className="lg:text-7xl text-3xl">Your profile is live, Jane.</h1>
          <h2 className="lg:text-2xl text-md">
            We’ve added you to our directory. Enjoyed the process? Share matchya
            with your colleagues!
          </h2>
          <div className="flex flex-row mt-4 gap-4 w-full">
            <div className="profile-field w-full">
              <input
                type="text"
                name="name"
                placeholder="https://your-bio.com"
                value={bioLink}
                onChange={(e) => setBioLink(e.target.value)}
                className="w-full"
              />
            </div>
            <PrimaryBtn
              text="Create Profile"
              onClick={handleCreateProfile}
              className="bg-green-light w-fit whitespace-nowrap"
            />
          </div>
          <p className="mt-4">
            Or{" "}
            <a
              href="#
            "
            >
              <span className="underline underline-offset-2 cursor-pointer">
                create a profile manually
              </span>
            </a>
          </p>
        </div>
      </div>{" "}
    </div>
  );
};

export default SubmitBioForm;
