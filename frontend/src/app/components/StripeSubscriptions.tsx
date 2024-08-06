"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StripePricingTable from "./StripePricingTable";
import { aspekta } from "../styles/fonts";
import { useUser } from "@clerk/nextjs";

const StripeSubscriptions = ({
  userId = "user_test_123",
}: {
  userId: string;
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    console.log("loaded user", user);
  }, [user]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage("Subscription successful! You can now access your content.");
    }
    if (query.get("canceled")) {
      setMessage("Subscription canceled. You can try again when youre ready.");
    }
  }, []);

  return (
    <div
    className={`md:h-screen bg-beige-light gap-2 flex flex-col sm-p-4 h-screen ${aspekta.className} transition ease-in-out`}
    id="page-layout"
  >
    <div className="h-full">

      {/* <h1 className="text-2xl font-bold mb-4">Test Subscriptions</h1> */}
      {/* {message && <p className="mb-4 text-green-600">{message}</p>} */}
      {/* <div className="mb-4">
        <h2 className="text-xl font-semibold">6 Month Subscription</h2>
        <p className="text-gray-600">CA$69.99 every 6 months</p>
      </div> */}
      {/* <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
      >
        {isLoading ? "Processing..." : "Subscribe"}
      </button> */}

      <div className="md:bg-grey px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 md:rounded-2xl h-full z-10 md:overflow-hidden relative">
        <div
          className="absolute lg:w-6/12 lg:h-full md:right-0 lg:top-0 z-0 w-full h-1/2 bottom-0 hidden md:block"
          style={{
            backgroundImage: 'url("/assets/images/couch.jpeg")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="lg:py-8 px-2 py-4 lg:px-20 md:px-10 flex flex-row md:justify-between lg:absolute w-full top-0 left-0">
          <img
            src="/assets/images/matchya-for-therapists.png"
            className="w-auto md:h-11 h-8"
            alt="matchya for therapists"
          />
          <div className="flex-row gap-2 md:flex hidden">
          </div>
        </div>

        <div
          className="lg:grid lg:grid-cols-2 lg:justify-center lg:h-full lg:my-auto flex flex-col md:py-20 md:gap-16 gap-4"
          id="two-panels"
        >
          <div className="flex flex-col lg:gap-14 gap-4 justify-center">
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

            <div className="flex flex-col md:gap-6 gap-2 lg:text-left text-center sm:my-0 my-4">
              <h1 className="lg:text-7xl text-3xl">Automate your online referrals</h1>
              <h2 className="lg:text-2xl text-md">
                Get listed on Matchya today
              </h2>
            </div>

          </div>

          <div className="flex items-center justify-center z-20 bg-[#fff] rounded-2xl border border-gray-300 sm:w-8/12 sm:m-auto w-full p-8" id="">
              <StripePricingTable
                pricingTableId="prctbl_1Pi1cqI5HXM3pHflJ4c6fBLz"
                publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                clientReferenceId={userId}
          />
          </div>
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default StripeSubscriptions;
