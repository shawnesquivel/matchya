"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StripePricingTable from "../components/StripePricingTable";

const StripeSubscriptions = ({
  userId = "user_test_123",
}: {
  userId: string;
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setMessage("Subscription successful! You can now access your content.");
    }
    if (query.get("canceled")) {
      setMessage("Subscription canceled. You can try again when youre ready.");
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lookup_key: "6_Month_Subscription-c11167f",
          client_reference_id: userId,
        }),
      });
      const data = await response.json();

      // Navigate to Stripe checkout page
      if (data.url) {
        router.push(data.url);
      } else {
        setMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <StripePricingTable
        pricingTableId="prctbl_1Pi1cqI5HXM3pHflJ4c6fBLz"
        publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        clientReferenceId={userId}
      />
      <h1 className="text-2xl font-bold mb-4">Test Subscriptions</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">6 Month Subscription</h2>
        <p className="text-gray-600">CA$69.99 every 6 months</p>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
      >
        {isLoading ? "Processing..." : "Subscribe"}
      </button>
    </div>
  );
};

export default StripeSubscriptions;
