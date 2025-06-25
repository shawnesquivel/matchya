"use client";

import React from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export default function ClerkDemo() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Clerk Authentication Demo</h1>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {!isLoaded ? (
            <p className="text-gray-600">Loading...</p>
          ) : isSignedIn ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ Signed In</p>
              <p className="text-gray-700">
                <strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-gray-700">
                <strong>Name:</strong> {user?.fullName}
              </p>
              <p className="text-gray-700">
                <strong>User ID:</strong> {user?.id}
              </p>
            </div>
          ) : (
            <p className="text-red-600 font-medium">❌ Not Signed In</p>
          )}
        </div>

        {/* Authentication Components */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication Components</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Sign In Button:</span>
              <SignInButton />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium">Sign Up Button:</span>
              <SignUpButton />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium">User Button:</span>
              <UserButton />
            </div>
          </div>
        </div>

        {/* Conditional Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Conditional Content</h2>

          <SignedOut>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🔒 Signed Out Content</h3>
              <p className="text-blue-700">
                This content is only visible to users who are not signed in. Use the buttons above
                to sign in or create an account.
              </p>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Signed In Content</h3>
              <p className="text-green-700">
                This content is only visible to authenticated users. Welcome,{" "}
                {user?.firstName || "User"}!
              </p>
              <div className="mt-4">
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                  Sign Out (via UserButton)
                </button>
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:text-blue-800 underline">
              ← Back to Home
            </a>
            <a href="/profile" className="block text-blue-600 hover:text-blue-800 underline">
              → Go to Profile Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
