"use client";

import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function TherapistDirectoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white-dark">{children}</main>
      <Footer />
    </div>
  );
}
