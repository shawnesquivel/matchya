"use client";
import React, { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { aspekta } from "../styles/fonts";

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
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-5xl">Just 2 More Steps</h1>
        <h2 className="text-3xl">
          Just paste your bio from your website to get a profile created
          automatically.
        </h2>
        <div className="flex flex-row mt-4 gap-4">
          <input
            type="text"
            placeholder="https://your-bio.com"
            value={bioLink}
            onChange={(e) => setBioLink(e.target.value)}
            className="p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={handleCreateProfile}
            className="p-2 bg-blue-500 text-white rounded-r"
          >
            Create Profile
          </button>
        </div>
        <p className="mt-4">
          Or{" "}
          <span className="underline underline-offset-2 cursor-pointer">
            create a profile manually
          </span>
        </p>
      </div>
    </div>
  );
};

export default SubmitBioForm;
