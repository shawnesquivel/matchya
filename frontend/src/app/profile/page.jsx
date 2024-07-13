"use client";
import React, { useState } from "react";
import Link from "next/link";
import EditProfileForm from "./EditProfileForm";
const ProfilePage = () => {
  // call web scraper
  const [signedUp, setSignedUp] = useState(false);
  return (
    <>
      {!signedUp && (
        <div className="" id="page-layout">
          {/* Navbar */}
          <div className="flex flex-row justify-between">
            <img
              src="/assets/images/matchya-for-therapists.png"
              className="w-52 h-16"
              alt="matchya for therapists"
            />
            <div className="flex flex-row">
              <button className="p-4 ">Login</button>
              <button className="p-4">Get Started</button>
            </div>
          </div>

          <div className="flex-row flex" id="two-panels">
            <div className="left-col">
              <h1>Go Live, Get Clients</h1>
              <h2>
                Get your profile live in ~3 minutes and let our system handle
                client acquisition for you.
              </h2>
              <input type="text" placeholder="Your Email" />
              <button
                className="bg-green-300"
                onClick={() => {
                  console.log("To Do: Create Profile in Clerk");
                  setSignedUp(true);
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="" id="right-col">
              <p>
                weve found a therapist in your area that matches your needs.
              </p>
              <p>nora chang</p>
            </div>
          </div>
        </div>
      )}

      {signedUp && <EditProfileForm />}
    </>
  );
};

export default ProfilePage;
