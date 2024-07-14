"use client";
import React, { useState } from "react";
import EditProfileForm from "../EditProfileForm";
import SignUpPage from "../SignUpPage";
import { SignedOut, SignedIn } from "@clerk/nextjs";

const ProfilePage = () => {
  // call web scraper
  const [signedUp, setSignedUp] = useState(false);

  return (
    <>
      <SignedOut>
        <SignUpPage />
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
