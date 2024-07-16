"use client";
import React from "react";
import { aspekta } from "../styles/fonts";
import PrimaryBtn from "../components/PrimaryBtn";
import { UserButton } from "@clerk/clerk-react";
import Link from "next/link";

const SubmitBioForm = ({
  bioLink,
  setBioLink,
  handleSubmit,
  errorMsg,
  isLoading,
  handleManualProfile,
}) => {
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
          <h1 className="lg:text-7xl text-3xl">Just 2 More Steps</h1>
          <h2 className="lg:text-2xl text-md">
            Just paste your bio from your website to get a profile created
            automatically.
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
              onClick={handleSubmit}
              className="bg-green-light w-fit whitespace-nowrap"
            />
          </div>
          <p className="mt-4">
            Or
            <Link
              href={"/profile/edit"}
              className="underline underline-offset-2 cursor-pointer"
              onClick={(e) => handleManualProfile(e, true)}
            >
              create a profile manually!
            </Link>
          </p>
          {isLoading && (
            <p className="text-amber-600">
              Loading your profile, please wait....
            </p>
          )}
          {errorMsg && <p className="text-red-400 italic">{errorMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default SubmitBioForm;
