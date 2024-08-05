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
    >
      Manage Billing
    </button>
  );
};

export default CustomerPortalBtn;
