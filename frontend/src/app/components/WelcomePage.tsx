import React, { useState, useEffect } from "react";
import { useTherapist } from "../contexts/TherapistContext";
import Header from "./Header";
import Footer from "./Footer";
import AnimatedLink from "./AnimatedLink";

interface WelcomePageProps {
  onLocationSelected: () => void;
}

export default function WelcomePage({ onLocationSelected }: WelcomePageProps) {
  const { updateLocation } = useTherapist();
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleLocationChange = (locationValue: string) => {
    setSelectedLocation(locationValue);
  };

  const handleExploreClick = async () => {
    if (!selectedLocation) return;

    // Parse the locationValue to get city and province
    let clinic_city = null;
    let clinic_province = null;

    if (selectedLocation) {
      // Split "Vancouver, BC" into ["Vancouver", "BC"]
      const parts = selectedLocation.split(", ");
      if (parts.length === 2) {
        clinic_city = parts[0];
        clinic_province = parts[1];
      }
    }

    // Use the new updateLocation function which handles comparison internally
    await updateLocation(clinic_city, clinic_province);

    // Always trigger the callback to show the main app
    onLocationSelected();
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full space-y-10 text-center">
          <h1 className="md:text-5xl text-2xl font-new-spirit font-light">
            Find Your{" "}
            <span className="italic" style={{ position: "relative", display: "inline-block" }}>
              Ideal
              <svg
                width="100%"
                height="7"
                viewBox="0 0 128 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  bottom: "-8px",
                  left: 0,
                  width: "100%",
                }}
              >
                <path
                  d="M1 5C25.8657 2.73613 85.8776 -0.433289 127 5"
                  stroke="#C8D357"
                  strokeWidth="3"
                />
              </svg>
            </span>{" "}
            Therapist
          </h1>
          {/* Location Dropdown */}
          <div className="max-w-[800px] mx-auto relative">
            <select
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full sm:py-8 sm:px-6 py-4 px-4 rounded-lg border border-grey-light text-grey-extraDark bg-white shadow-sm focus:ring-1 focus:ring-green-light focus:border-transparent appearance-none"
              defaultValue=""
              value={selectedLocation}
            >
              <option value="" disabled>
                Select your location
              </option>
              <option value="Vancouver, BC">Vancouver</option>
              <option value="Toronto, ON">Toronto</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-mblack"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>{" "}
            </div>
          </div>

          {/* Explore Providers Button */}
          <div className="mt-6">
            <button
              onClick={handleExploreClick}
              disabled={!selectedLocation}
              className={`px-8 py-3 rounded-full text-white font-medium transition-all ${
                selectedLocation
                  ? "bg-green hover:bg-green-dark"
                  : "bg-grey-dark cursor-not-allowed"
              }`}
            >
              Explore Providers
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-grey-extraDark mt-4">
            Don't see your city?{" "}
            <AnimatedLink
              href="#tally-open=wovq1x&tally-hide-title=1&tally-overlay=1"
              className="text-grey-medium"
            >
              Request a new location
            </AnimatedLink>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
