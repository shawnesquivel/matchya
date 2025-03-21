import React from "react";
import Image from "next/image";
import LocationDisplay from "./LocationDisplay";

interface HeaderProps {
  className?: string;
  showLocationDisplay?: boolean;
  handleResetLocation?: () => void;
}

export default function Header({
  className = "",
  showLocationDisplay = false,
  handleResetLocation,
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 bg-beige-extralight border-b border-grey-light ${className}`}
    >
      <div className="px-4 py-4 flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <div className="h-6 w-auto">
            <a href="/">
              <Image
                src="/assets/images/matchyalogo.png"
                alt="Matchya Logo"
                width={120}
                height={36}
                priority
                className="object-contain h-full w-auto"
              />
            </a>
          </div>
          <p className="text-xs text-green font-medium">Find Your Ideal Therapist</p>
        </div>

        {showLocationDisplay && handleResetLocation && (
          <div className="flex items-center">
            <LocationDisplay handleResetLocation={handleResetLocation} />
          </div>
        )}
      </div>
    </header>
  );
}
