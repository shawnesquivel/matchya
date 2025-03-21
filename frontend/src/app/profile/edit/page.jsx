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
    if (user?.unsafeMetadata?.profileStarted === false) {
      console.log("Profile not started, re-routing to /profile.");
      router.push(`/profile`);
    }
  }, [user]);

  if (!user)
    return (
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    );

  const handleManualProfile = (e, profileStarted) => {
    /** Update the profileStarted property */
    e.preventDefault();
    if (user) {
      try {
        console.log("updating user.unsafeMetadata.profileStarted: ", profileStarted);
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
        <EditProfileForm handleManualProfile={handleManualProfile} />
      </SignedIn>
    </>
  );
};

export default EditProfilePage;
