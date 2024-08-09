import React, { useState } from "react";
import Link from "next/link";
import { aspekta } from "../../styles/fonts";

const SuccessPage = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = "https://matchya.app";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    });
  };

  return (
    <div
      className={`${aspekta.className} flex flex-col items-center justify-center min-h-screen bg-gray-100`}
    >
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Your profile is live!</h1>
        <p className="text-lg mb-6">
          We've added you to our directory. Enjoyed the process? Share matchya
          with your colleagues!
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/profile/edit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Back to Profile
          </Link>
          <button
            onClick={handleShare}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Share Matchya
          </button>
        </div>
        {copied && (
          <p className="mt-4 text-green-600">URL copied to clipboard!</p>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
