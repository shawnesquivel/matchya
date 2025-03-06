"use client";
import Image from "next/image";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import { TherapistProfile } from "../utils/supabaseHelpers";

interface TherapistHeaderProps {
  therapist: TherapistProfile;
  variant: "modal" | "page";
  showBookingButton?: boolean;
}

/**
 * Reusable therapist header component showing profile image, name, title, and location
 */
export default function TherapistHeader({
  therapist,
  variant = "page",
  showBookingButton = true,
}: TherapistHeaderProps) {
  // Style configurations based on variant
  const containerClasses =
    variant === "modal"
      ? "flex mb-6 items-center"
      : "grid grid-cols-6 gap-8 container mx-auto";

  const imageContainerClasses =
    variant === "modal"
      ? "relative w-24 h-24 rounded-full overflow-hidden mr-4"
      : "relative md:col-span-1 sm:col-span-2 col-span-6";

  const infoContainerClasses =
    variant === "modal" ? "" : "flex flex-col gap-2 md:col-span-3 col-span-6";

  const nameClasses =
    variant === "modal"
      ? "text-2xl font-bold"
      : "font-tuppence font-light text-3xl lg:text-4xl font-bold md:mb-2 md:pb-12";

  return (
    <div className={containerClasses}>
      {/* Image container */}
      <div className={imageContainerClasses}>
        {variant === "page" ? (
          <div className="relative w-[40vw] md:w-full md:left-0 md:translate-x-0">
            <div className="absolute max-w-[150px] md:max-w-none w-full bottom-0 border border-grey-extraDark aspect-square rounded-full overflow-hidden md:translate-y-[50%]">
              <Image
                src={getSafeImageUrl(therapist.imageUrl)}
                alt={`${therapist.name}'s profile photo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
        ) : (
          <Image
            src={getSafeImageUrl(therapist.imageUrl)}
            alt={`${therapist.name}'s profile photo`}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Therapist info */}
      <div className={infoContainerClasses}>
        <h1 id="therapist-profile-title" className={nameClasses}>
          {therapist.name || "Name Not Available"}
        </h1>
        {variant === "modal" && (
          <>
            <p className="text-gray-600">{therapist.title}</p>
            <p className="text-gray-600">
              {therapist.location.city}, {therapist.location.province}
            </p>
          </>
        )}
      </div>

      {/* Booking buttons - only shown on page variant or if explicitly requested */}
      {variant === "page" && showBookingButton && (
        <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start sm:flex-col-reverse sm:flex-col lg:flex-row">
          {therapist.bio_link && (
            <a
              href={therapist.bio_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full flex justify-center align-middle px-4 h-fit py-4 text-mblack"
            >
              View website
            </a>
          )}
          {therapist.booking_link && (
            <a
              href={therapist.booking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full flex justify-center align-middle px-4 h-fit py-4 bg-green text-white-dark"
            >
              Book an Appointment
            </a>
          )}
        </div>
      )}
    </div>
  );
}
