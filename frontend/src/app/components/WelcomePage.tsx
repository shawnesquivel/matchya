import React from "react";
import { useTherapist } from "../contexts/TherapistContext";
import Image from "next/image";

interface WelcomePageProps {
  onLocationSelected: () => void;
}

export default function WelcomePage({ onLocationSelected }: WelcomePageProps) {
  const { updateTherapists } = useTherapist();

  const handleLocationChange = async (locationValue: string) => {
    console.log("WelcomePage: Location selected:", locationValue);

    // Parse the locationValue to get city and province
    let clinic_city = null;
    let clinic_province = null;

    if (locationValue) {
      // Split "Vancouver, BC" into ["Vancouver", "BC"]
      const parts = locationValue.split(", ");
      if (parts.length === 2) {
        clinic_city = parts[0];
        clinic_province = parts[1];
      }
    }

    // Just update the location filter without triggering a search
    await updateTherapists({
      type: "DIRECT",
      filters: {
        clinic_city,
        clinic_province,
      },
      skipSearch: true, // Skip the therapist search
    });

    // Then trigger the callback to show the main app
    onLocationSelected();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/images/matchyalogo.png"
            alt="Matchya Logo"
            width={200}
            height={60}
            priority
            className="object-contain"
          />
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Ideal Therapist
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Start by selecting your location
        </p>

        {/* Location Dropdown */}
        <div className="w-full max-w-xs mx-auto">
          <select
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-3 rounded-lg border border-grey-light text-grey-extraDark bg-white shadow-sm focus:ring-2 focus:ring-green-light focus:border-transparent"
            defaultValue=""
          >
            <option value="" disabled>
              Select your location
            </option>
            <option value="Vancouver, BC">Vancouver</option>
            <option value="Toronto, ON">Toronto</option>
            <option value="">All Locations (Online Only)</option>
          </select>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-500 mt-4">
          Don't see your city? Select "All Locations" to see online therapists.
        </p>
      </div>
    </div>
  );
}
