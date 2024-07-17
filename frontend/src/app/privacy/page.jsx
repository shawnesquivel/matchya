import React from "react";
import Link from "next/link";
const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/`} className="underline  underline-offset-2">
        {" "}
        Back to home
      </Link>
      <h1 className="text-3xl font-bold text-center mb-8">
        Matchya's Privacy Policy
      </h1>
      <p className="text-gray-600 mb-4">Last updated: July 16, 2024</p>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Introduction
        </h2>
        <p className="text-gray-600">
          Welcome to Matchya. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you visit our website.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Information Collection and Use
        </h2>
        <p className="text-gray-600">
          We collect several different types of information for various purposes
          to provide and improve our Service to you.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Cookies</h2>
        <p className="text-gray-600">
          We use cookies and similar tracking technologies to track the activity
          on our Service and hold certain information.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Data Sharing
        </h2>
        <p className="text-gray-600">
          We may share your information with third parties for the purpose of
          providing and improving our services.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Data Security
        </h2>
        <p className="text-gray-600">
          We strive to use commercially acceptable means to protect your
          Personal Data, but we cannot guarantee its absolute security.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          User Rights
        </h2>
        <p className="text-gray-600">
          You have the right to access, update, or delete the information we
          have on you. Please contact us to exercise these rights.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600">
          If you have any questions about this Privacy Policy, please contact us
          at contact@matchya.app.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
