"use client";
import React from "react";
import { useRouter } from "next/navigation";

const CustomerPortalBtn = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        router.push(process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL);
      }}
      className="px-6 py-3 bg-transparent text-black rounded-lg hover:bg-gray-100 transition duration-300 w-1/4 underline underline-offset-4"
    >
      Manage Billing
    </button>
  );
};

export default CustomerPortalBtn;
