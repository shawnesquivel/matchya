"use client";
import React, { useEffect, useState } from "react";
import EditProfileForm from "../EditProfileForm";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import SubmitBioForm from "../SubmitBioForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SignUpPage from "../SignUpPage";

const ProfilePage = () => {
  // call web scraper
  const { isLoaded, isSignedIn, user } = useUser();
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState("");
  const [bioLink, setBioLink] = useState("");
  const router = useRouter();

  let userObj;

  const handleManualProfile = (e, profileStarted) => {
    e.preventDefault();
    if (user) {
      try {
        console.log("setting profileStarted to ", profileStarted);
        user.update({
          unsafeMetadata: {
            profileStarted: profileStarted,
          },
        });
        // Redirect to profile/edit page
        router.push(`/profile/edit`);
      } catch (error) {
        console.error("Error updating user metadata:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      userObj = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddress: user?.externalAccounts[0]?.emailAddress,
        profileStarted: user?.unsafeMetadata?.profileStarted,
        ...user?.unsafeMetadata?.webScrapeData?.data,
      };
      console.log("fetched user object", userObj);
    }

    if (
      isLoaded &&
      isSignedIn &&
      user?.unsafeMetadata?.profileStarted === true
    ) {
      router.push(`/profile/edit`);
    } else {
      console.log(
        "not started",
        isLoaded,
        isSignedIn,
        user?.unsafeMetadata?.profileStarted
      );
    }
  }, [user]);

  const handleCreateProfile = async () => {
    if (!bioLink) {
      alert(`Please enter a bio link. Provided link: ${bioLink}`);
      return;
    }

    setError("");
    setIsScraping(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/profile/scrape?bio_link=${encodeURIComponent(bioLink)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      console.log(data); // Handle the response data as needed
      console.log("fetched the result");

      const newMetadata = {
        profileStarted: true,
        bio_link: bioLink,
        webScrapeData: data,
      };
      console.log("updating the unsafeMetadata", newMetadata);
      // if success, change user.unsafeMetadatata.profileStarted to  True
      user.update({
        unsafeMetadata: newMetadata,
      });
      console.log("updating clerk user");
      console.log("user updated", user?.unsafeMetadata?.profileStarted);
      setIsScraping(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsScraping(false);
      setError(
        `There was an error fetching your profile. Please check that the link you have provided is a valid https:// link. Link provided: ${bioLink}. If you continue to see this error, please enter your profile manually.`
      );
    }
  };
  if (!isLoaded || !isSignedIn) {
    return (
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    );
  }
  return (
    <>
      <SignedIn>
        {/* TODO: The EditProfile Form should only appear if the therapist is signed in. */}
        {user?.unsafeMetadata?.profileStarted ? (
          <EditProfileForm handleManualProfile={handleManualProfile} />
        ) : (
          <SubmitBioForm
            handleSubmit={handleCreateProfile}
            bioLink={bioLink}
            setBioLink={setBioLink}
            errorMsg={error}
            isLoading={isScraping}
            handleManualProfile={handleManualProfile}
          />
        )}
      </SignedIn>
    </>
  );
};

export default ProfilePage;
