"use client";
import React, { useEffect, useState } from "react";
import EditProfileForm from "../EditProfileForm";
import { SignedIn } from "@clerk/nextjs";
import SubmitBioForm from "../SubmitBioForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  // call web scraper
  const { isLoaded, isSignedIn, user } = useUser();
  const [isScraping, setIsScraping] = useState(false);
  const [bioLink, setBioLink] = useState("");
  const router = useRouter();

  let userObj;

  useEffect(() => {
    if (user) {
      userObj = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddress: user?.externalAccounts[0].emailAddress,
        profileStarted: user?.unsafeMetadata?.profileStarted,
        ...user?.unsafeMetadata,
      };
    }

    if (isLoaded && isSignedIn && user?.unsafeMetadata?.profileStarted) {
      router.push(`/profile/edit`);
    }
  }, [user]);

  const handleCreateProfile = async () => {
    setIsScraping(true);

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
      console.log("fetched the result");
      // if success, change user.unsafeMetadatata.profileStarted to  True
      user.update({
        unsafeMetadata: {
          profileStarted: true,
          webScrapeData: data,
        },
      });
      console.log("updating clerk user");
      console.log("user updated", user?.unsafeMetadata?.profileStarted);
      setIsScraping(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsScraping(false);
    }
  };
  if (!isLoaded || !isSignedIn) {
    return null;
  }
  return (
    <>
      <SignedIn>
        {/* TODO: The EditProfile Form should only appear if the therapist is signed in. */}
        {/* <EditProfileForm /> */}
        {user?.unsafeMetadata?.profileStarted ? (
          <EditProfileForm userObj={userObj} isScraping={isScraping} />
        ) : (
          <SubmitBioForm
            user={userObj}
            handleSubmit={handleCreateProfile}
            bioLink={bioLink}
            setBioLink={setBioLink}
          />
        )}
      </SignedIn>
    </>
  );
};

export default ProfilePage;
