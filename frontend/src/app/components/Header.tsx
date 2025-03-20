import React from "react";
import Image from "next/image";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
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
      </div>
    </header>
  );
}
