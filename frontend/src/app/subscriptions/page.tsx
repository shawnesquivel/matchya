"use client";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import StripeSubscriptions from "../components/StripeSubscriptions";
import SignUpPage from "../profile/SignUpPage";

const StripeSubscriptionsPage = () => {
  return (
    <>
      <SignedIn>
        <StripeSubscriptions />
      </SignedIn>
      <SignedOut>
        <SignUpPage />
      </SignedOut>
    </>
  );
};

export default StripeSubscriptionsPage;
