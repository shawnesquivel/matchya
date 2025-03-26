"use client";

import { useSearchParams } from "next/navigation";
import TherapistNotFoundContent from "@/components/TherapistNotFoundContent";

export default function TherapistNotFoundPage() {
  const searchParams = useSearchParams();

  // Get search term from URL parameters and handle the case when it's "null"
  const rawSearchTerm = searchParams.get("q") || "";
  const searchedName = rawSearchTerm === "null" ? "" : rawSearchTerm;

  return <TherapistNotFoundContent searchedName={searchedName} />;
}
