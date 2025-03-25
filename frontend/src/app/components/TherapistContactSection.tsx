"use client";

import { TherapistProfile } from "@/app/utils/supabaseHelpers";
import { trackOutboundLink } from "@/app/utils/analytics";
import GlobeIcon from "@/components/icons/GlobeIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";

interface TherapistContactSectionProps {
  therapist: TherapistProfile;
}

export default function TherapistContactSection({ therapist }: TherapistContactSectionProps) {
  return (
    <div className="bg-beige-extralight p-10 flex flex-col sm:flex-row rounded-lg border border-grey-light gap-2 container mx-auto justify-between items-center">
      <h2 className="font-new-spirit font-light text-2xl">
        Get in touch with {therapist.first_name}
      </h2>
      <div className="flex gap-2">
        <div className="md:col-span-2 col-span-6 flex flex-col sm:flex-row gap-2 mb-6 sm:mb-0 md:justify-end justify-start">
          {therapist.clinic_profile_url && (
            <a
              href={therapist.clinic_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 text-mblack bg-beige transition-all duration-300 transform hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                trackOutboundLink(therapist.clinic_profile_url, {
                  id: therapist.id,
                  name: `${therapist.first_name} ${therapist.last_name}`,
                  linkType: "website",
                  source: "permalink",
                });
              }}
            >
              <GlobeIcon className="w-4 h-4 mr-2" />
              View Website
            </a>
          )}
          {therapist.booking_link && (
            <a
              href={therapist.booking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="fill-from-left rounded-full flex items-center justify-center px-4 py-3 bg-green text-white transition-all duration-300 transform hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                trackOutboundLink(therapist.booking_link, {
                  id: therapist.id,
                  name: `${therapist.first_name} ${therapist.last_name}`,
                  linkType: "booking",
                  source: "permalink",
                });
              }}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Book Appointment
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
