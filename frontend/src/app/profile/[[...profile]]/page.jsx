import React from "react";
import EditProfileForm from "../EditProfileForm";
import SignUpPage from "../SignUpPage";
import { SignedOut, SignedIn } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import SubmitBioForm from "../SubmitBioForm";

const ProfilePage = async () => {
  // call web scraper
  const { userId } = auth();
  if (!userId)
    return (
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    );

  let userObj;

  if (userId) {
    const userData = await currentUser();
    userObj = {
      firstName: userData?.firstName,
      lastName: userData?.lastName,
      emailAddress: userData?.externalAccounts[0].emailAddress,
      profileStarted: userData?.publicMetadata?.profileStarted,
      ...userData?.publicMetadata,
    };
  }

  console.log(userObj.profileStarted, typeof userObj.profileStarted);

  return (
    <>
      <SignedIn>
        {/* TODO: The EditProfile Form should only appear if the therapist is signed in. */}
        {/* <EditProfileForm /> */}
        {userObj?.profileStarted ? (
          <EditProfileForm user={userObj} />
        ) : (
          <SubmitBioForm user={userObj} />
        )}
      </SignedIn>
    </>
  );
};

export default ProfilePage;
