"use client";
import React, { useEffect } from "react";
import EditProfileForm from "../EditProfileForm";
import { SignedOut, SignedIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import SignUpPage from "../SignUpPage";
import { useRouter } from "next/navigation";

const EditProfilePage = () => {
  const { user } = useUser();
  const router = useRouter();

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

    if (user?.unsafeMetadata?.profileStarted === false) {
      router.push(`/profile`);
    }
  }, [user]);

  if (!user)
    return (
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    );

  let userObj;

  if (user) {
    userObj = {
      firstName: user?.firstName,
      lastName: user?.lastName,
      emailAddress: user?.externalAccounts[0].emailAddress,
      profileStarted: user?.unsafeMetadata?.profileStarted,
      ...user?.unsafeMetadata,
    };
  }

  const handleManualProfile = (e, profileStarted) => {
    console.log("hello wrold");
    e.preventDefault();
    console.log("hello wrold");
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

  return (
    <>
      <SignedIn>
        <EditProfileForm
          userObj={userObj}
          handleManualProfile={handleManualProfile}
        />
      </SignedIn>
    </>
  );
};

export default EditProfilePage;
