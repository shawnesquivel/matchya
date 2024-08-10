import React from "react";
import { aspekta } from "../styles/fonts";

const ProfileLoadingSkeleton = () => {
  return (
    <div
      className={`bg-white gap-2 flex flex-col sm:p-4 p-1 h-full lg:h-screen ${aspekta.className} transition ease-in-out`}
    >
      <div className="bg-grey px-2 pt-0 flex flex-col lg:gap-6 lg:px-20 lg:py-16 md:px-10 rounded-2xl h-full z-10 overflow-hidden relative">
        <div className="absolute right-4 top-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <div className="flex flex-col gap-2 mb-4 sm:mb-0">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-end">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
          </div>
        </div>
        <div className="flex gap-6 h-full sm:flex-row flex-col">
          <div className="flex sm:flex-col sm:gap-1 flex-row gap-3">
            {["Info", "Bio", "Expertise", "Credentials"].map((tab, index) => (
              <div
                key={index}
                className="h-8 bg-gray-200 rounded w-24 animate-pulse"
              ></div>
            ))}
          </div>
          <div className="h-full w-full">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLoadingSkeleton;
