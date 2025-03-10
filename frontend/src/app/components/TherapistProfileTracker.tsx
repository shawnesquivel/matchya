"use client";
import { useEffect } from "react";
import { trackTherapistProfileView } from "../utils/analytics";

interface TherapistData {
  id: string;
  first_name: string;
  last_name: string;
}

export default function TherapistProfileTracker({ therapist }: { therapist: TherapistData }) {
  useEffect(() => {
    // Track the profile view when component mounts
    console.log("Tracking profile view for:", therapist.id);
    trackTherapistProfileView({
      id: therapist.id,
      name: `${therapist.first_name} ${therapist.last_name}`,
      source: "permalink",
    });
  }, [therapist]);

  return null; // This component doesn't render anything, just tracks
}
