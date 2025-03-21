"use client";
import { useEffect } from "react";
import { trackTherapistProfileView } from "../utils/analytics";

interface TherapistData {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TherapistProfileTracker({ therapist }: { therapist: TherapistData }) {
  console.log("TherapistProfileTracker mounted with data:", therapist);

  useEffect(() => {
    // Track the profile view when component mounts
    console.log("Tracking profile view for:", therapist.id);

    // Small timeout to ensure the dataLayer is properly initialized
    setTimeout(() => {
      trackTherapistProfileView({
        id: therapist.id,
        name: `${therapist.first_name} ${therapist.last_name}`,
        source: "permalink",
      });
      console.log("Profile view tracking completed");
    }, 500);

    // Cleanup function
    return () => {
      console.log("TherapistProfileTracker unmounted");
    };
  }, [therapist]);

  // Return an empty div instead of null for debugging
  return <div data-testid="profile-tracker" style={{ display: "none" }} />;
}
