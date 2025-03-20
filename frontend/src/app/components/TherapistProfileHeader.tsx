"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Header from "./Header";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import type { TherapistProfile } from "../utils/supabaseHelpers";
import { trackOutboundLink } from "../utils/analytics";

interface TherapistProfileHeaderProps {
  therapist: TherapistProfile;
}

export default function TherapistProfileHeader({ therapist }: TherapistProfileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Handle screen size and scroll events
  useEffect(() => {
    // Check for mobile device
    const checkMobile = () => {
      const mobileDetected = window.innerWidth < 768;
      setIsMobile(mobileDetected);
    };

    // Handle scroll events
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show therapist info after scrolling past the banner section
      setIsScrolled(currentScrollY > 200);

      // For mobile: hide when scrolling down, show when scrolling up
      if (isMobile) {
        const isScrollingDown = currentScrollY > lastScrollY.current;
        setIsHeaderVisible(!isScrollingDown || currentScrollY < 100);
        lastScrollY.current = currentScrollY;
      }
    };

    // Initial checks
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  // Determine if we have links to show
  const hasWebsite = therapist.clinic_profile_url;
  const hasBooking = therapist.booking_link;
  const websiteUrl = therapist.clinic_profile_url || "";

  // Handle analytics tracking for outbound links
  const handleWebsiteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const eventObj = {
      therapistId: therapist.id,
      therapistName: `${therapist.first_name} ${therapist.last_name}`,
      linkType: "website",
      url: websiteUrl,
    };
    // @ts-ignore - We're handling the argument mismatch for now
    trackOutboundLink(eventObj);
  };

  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const eventObj = {
      therapistId: therapist.id,
      therapistName: `${therapist.first_name} ${therapist.last_name}`,
      linkType: "booking",
      url: therapist.booking_link || "",
    };
    // @ts-ignore - We're handling the argument mismatch for now
    trackOutboundLink(eventObj);
  };

  // Desktop header with scrolled therapist info
  const DesktopHeader = () => (
    <header className="sticky top-0 z-40 bg-beige-extralight border-b border-grey-light shadow-sm transition-all duration-300">
      <div className="container px-4 py-4 flex justify-between items-center m-auto">
        <div className="flex items-center">
          {/* Logo */}
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
        <div className="flex items-center gap-3 transition-all duration-300">
          {/* Therapist info - shown only when scrolled */}
          {isScrolled && (
            <div className="flex items-center border-r border-grey-light pr-4">
              {/* Therapist profile image */}
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-grey-light mr-2">
                {therapist.profile_img_url ? (
                  <Image
                    src={getSafeImageUrl(therapist.profile_img_url)}
                    alt={`${therapist.first_name} ${therapist.last_name}`}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="bg-grey-light h-full w-full"></div>
                )}
              </div>

              {/* Therapist name */}
              <span className="font-new-spirit font-light text-lg text-gray-800">
                {therapist.first_name} {therapist.last_name}
              </span>
            </div>
          )}

          {/* Action buttons - shown only when scrolled */}
          {isScrolled && (
            <div className="flex gap-2">
              {hasWebsite && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 text-sm text-mblack bg-beige transition-all duration-300 transform hover:shadow-sm"
                  onClick={handleWebsiteClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 mr-2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  View Website
                </a>
              )}

              {hasBooking && (
                <a
                  href={therapist.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 text-sm bg-green text-white transition-all duration-300 transform hover:shadow-sm"
                  onClick={handleBookingClick}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 mr-2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Book Appointment
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // Mobile header with normal logo and floating CTA
  const MobileHeader = () => (
    <>
      {/* Standard header */}
      <header className="sticky top-0 z-40 bg-beige-extralight border-b border-grey-light">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex flex-col">
            <div className="h-6 w-auto">
              <a href="/">
                <Image
                  src="/assets/images/matchyalogo.png"
                  alt="Matchya Logo"
                  width={100}
                  height={30}
                  priority
                  className="object-contain h-full w-auto"
                />
              </a>
            </div>
            <p className="text-xs text-green font-medium">Find Your Ideal Therapist</p>
          </div>
        </div>
      </header>

      {/* Floating CTA for mobile */}
      {isScrolled && (
        <div
          className={`fixed bottom-4 left-0 right-0 mx-auto w-[95%] max-w-md border border-grey-light bg-beige-extralight rounded-xl shadow-lg z-50 transition-all duration-300 transform ${
            isHeaderVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              {/* Therapist profile image */}
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-grey-light mr-2">
                {therapist.profile_img_url ? (
                  <Image
                    src={getSafeImageUrl(therapist.profile_img_url)}
                    alt={`${therapist.first_name} ${therapist.last_name}`}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="bg-grey-light h-full w-full"></div>
                )}
              </div>

              {/* Therapist name */}
              <span className="font-new-spirit font-light text-sm">
                {therapist.first_name} {therapist.last_name}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {hasWebsite && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fill-from-left rounded-full flex items-center justify-center px-3 py-2 text-xs text-mblack bg-beige"
                  onClick={handleWebsiteClick}
                >
                  Website
                </a>
              )}

              {hasBooking && (
                <a
                  href={therapist.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fill-from-left rounded-full flex items-center justify-center px-3 py-2 text-xs bg-green text-white"
                  onClick={handleBookingClick}
                >
                  Book
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return isMobile ? <MobileHeader /> : <DesktopHeader />;
}
