"use client";
import React, { useState } from "react";
import Link from "next/link";
import EditProfileForm from "../EditProfileForm";
import PrimaryBtn from "../../components/PrimaryBtn";
import { aspekta } from "../../styles/fonts";

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
          className={`bg-white gap-2 flex flex-col p-4 h-full ${aspekta.className} transition ease-in-out`}
          id="page-layout"
        >
          <div className="bg-grey px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 rounded-2xl h-full z-10 overflow-hidden relative">
            <div
              className="absolute w-6/12 h-full right-0 top-0 z-0"
              style={{
                backgroundImage: 'url("/assets/images/couch.jpeg")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="py-8 px-2 lg:px-20 md:px-10 flex flex-row justify-between absolute w-full top-0 left-0">
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

            <div
              className="grid grid-cols-2 justify-center h-full my-auto"
              id="two-panels"
            >
              <div className="flex flex-col gap-14 justify-center">
                <a
                  href="/"
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
                  <span>Back to matchya directory</span>
                </a>

                <div className="flex flex-col gap-6">
                  <h1 className="text-7xl">Go Live, Get Clients</h1>
                  <h2 className="text-2xl">
                    Get your profile live in ~3 minutes and let our system
                    handle client acquisition for you.
                  </h2>
                </div>
                {/* <input type="text" placeholder="Your Email" />
                <button
                  className="bg-green-300"
                  onClick={() => {
                    console.log("To Do: Create Profile in Clerk");
                    setSignedUp(true);
                  }}
                >
                  Sign Up
                </button> */}
              </div>

              <div className="flex items-center justify-center" id="">
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
    </>
  );
};

export default ProfilePage;
