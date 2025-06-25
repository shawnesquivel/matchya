"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TherapistNotFoundContent from "@/components/TherapistNotFoundContent";

function TherapistNotFoundInner() {
  const searchParams = useSearchParams();

  // Get search term from URL parameters and handle the case when it's "null"
  const rawSearchTerm = searchParams.get("q") || "";
  const searchedName = rawSearchTerm === "null" ? "" : rawSearchTerm;

  return <TherapistNotFoundContent searchedName={searchedName} />;
}

export default function GlobalTherapistNotFound() {
  return (
    <Suspense fallback={<TherapistNotFoundContent searchedName="" />}>
      <TherapistNotFoundInner />
    </Suspense>
  );
}
