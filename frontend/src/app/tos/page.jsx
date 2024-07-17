import React from "react";
import Link from "next/link";

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href={`/`} className="underline  underline-offset-2">
        {" "}
        Back to home
      </Link>
      <h1 className="text-3xl font-bold text-center mb-8">Terms of Service</h1>
      <p className="text-gray-600 mb-4">Last updated: July 16, 2024</p>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Introduction
        </h2>
        <p className="text-gray-600">
          Welcome to Matchya. These Terms of Service govern your use of our
          website and services.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Acceptance of Terms
        </h2>
        <p className="text-gray-600">
          By accessing or using our services, you agree to be bound by these
          Terms. If you disagree with any part of the terms, then you do not
          have permission to access our services.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Changes to Terms
        </h2>
        <p className="text-gray-600">
          We reserve the right to modify these Terms at any time. We will
          provide notice of changes by updating the terms on our website. Your
          continued use of our services following any changes constitutes
          acceptance of those changes.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Use of Services
        </h2>
        <p className="text-gray-600">
          You agree to use our services only for lawful purposes and in
          accordance with these Terms. You must not use our services in any way
          that causes, or may cause, damage to our website or impairment of the
          availability or accessibility of our services.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Account Security
        </h2>
        <p className="text-gray-600">
          You are responsible for maintaining the confidentiality of your
          account information and for all activities that occur under your
          account. You agree to notify us immediately of any unauthorized use of
          your account or any other breach of security.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Termination
        </h2>
        <p className="text-gray-600">
          We may terminate or suspend your account and access to our services
          immediately, without prior notice or liability, for any reason
          whatsoever, including, without limitation, if you breach the Terms.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600">
          If you have any questions about these Terms, please contact us at
          contact@matchya.app.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
