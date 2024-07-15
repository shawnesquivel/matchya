import React from "react";
import EditProfileForm from "../EditProfileForm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignedOut, SignedIn } from "@clerk/nextjs";

const EditProfilePage = async () => {
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
  return (
    <>
      <SignedIn>
        {/* TODO: The EditProfile Form should only appear if the therapist is signed in. */}
        {/* <EditProfileForm /> */}
        <EditProfileForm user={userObj} />
      </SignedIn>
    </>
  );
};

export default EditProfilePage;
