"use client";
import React, { useState } from "react";
import Link from "next/link";
import EditProfileForm from "../EditProfileForm";
import PrimaryBtn from "../../components/PrimaryBtn";
import {
  SignUp,
  SignedOut,
  SignedIn,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

const ProfilePage = () => {
  // call web scraper
  const [signedUp, setSignedUp] = useState(false);
  return (
    <>
      <SignedOut>
        <div
          className="bg-white gap-2 flex flex-col p-4 h-full"
          id="page-layout"
        >
          <div className="bg-grey px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 rounded-2xl h-full z-10 overflow-hidden">
            {/* <div
              className="absolute w-6/12 h-full right-0 z-0"
              style={{
                backgroundImage: 'url("/assets/images/couch.jpeggg")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            ></div> */}
            <div className="py-8 bg-grey flex flex-row justify-between ">
              <img
                src="/assets/images/matchya-for-therapists.png"
                className="w-auto h-11"
                alt="matchya for therapists"
              />
              <div className="flex flex-row gap-2">
                <PrimaryBtn
                  text="Log In"
                  onClick={undefined}
                  className="border-green-light"
                />
                <PrimaryBtn
                  text="Get Started"
                  onClick={undefined}
                  className="bg-green-light"
                />
              </div>
            </div>

            <div className="grid grid-cols-2" id="two-panels">
              <div className="">
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
                <p>profile div here</p>
                <SignUp />
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        {/* TODO: The EditProfile Form should only appear if the therapist is signed in. */}
        {/* <EditProfileForm /> */}
      </SignedIn>

      <EditProfileForm />
      {/* {!signedUp && (
        <div className="" id="page-layout">
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
      )} */}
    </>
  );
};

export default ProfilePage;
