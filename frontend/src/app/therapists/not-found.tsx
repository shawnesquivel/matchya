"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TherapistNotFoundContent from "@/components/TherapistNotFoundContent";

// Disable static generation for this page
// This page uses useSearchParams() which requires client-side rendering.
// During build time, Next.js tries to statically generate this page but
// useSearchParams() is not available during SSG, causing build failures.
// By setting dynamic = 'force-dynamic', we tell Next.js to render this
// page on-demand instead of during build, allowing the search params
// to be available when the page is actually accessed by users.
export const dynamic = "force-dynamic";

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
