"use client";
import React from "react";
import { trackOutboundLink } from "../utils/analytics";
import GlobeIcon from "../../components/icons/GlobeIcon";
import CalendarIcon from "../../components/icons/CalendarIcon";

interface OutboundLinkProps {
  therapist: {
    id: string;
    first_name: string;
    last_name: string;
    bio_link?: string;
    clinic_profile_url?: string;
    booking_link?: string;
  };
}

export default function OutboundLinkTracker({ therapist }: OutboundLinkProps) {
  const handleWebsiteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log("Website link clicked on permalink page:", therapist.id);
    const url = therapist.bio_link || therapist.clinic_profile_url || "";
    trackOutboundLink(url, {
      id: therapist.id,
      name: `${therapist.first_name} ${therapist.last_name}`,
      linkType: "website",
      source: "permalink",
    });
  };

  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log("Booking link clicked on permalink page:", therapist.id);
    trackOutboundLink(therapist.booking_link || "", {
      id: therapist.id,
      name: `${therapist.first_name} ${therapist.last_name}`,
      linkType: "booking",
      source: "permalink",
    });
  };

  // Use bio_link as fallback for clinic_profile_url and vice versa
  const websiteUrl = therapist.bio_link || therapist.clinic_profile_url;
  const hasWebsite = !!websiteUrl;
  const hasBooking = !!therapist.booking_link;

  // If no outbound links, return null
  if (!hasWebsite && !hasBooking) return null;

  return (
    <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start flex-col">
      {hasWebsite && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 text-mblack bg-beige transition-all duration-300 transform hover:shadow-sm"
          onClick={handleWebsiteClick}
        >
          <GlobeIcon className="w-4 h-4 mr-2" />
          View Website
        </a>
      )}
      {hasBooking && (
        <a
          href={therapist.booking_link}
          target="_blank"
          rel="noopener noreferrer"
          className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 bg-green text-white transition-all duration-300 transform hover:shadow-sm"
          onClick={handleBookingClick}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Book Appointment
        </a>
      )}
    </div>
  );
}
