import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Therapists by Location | Matchya",
  description:
    "Browse therapists by country and region. Find and connect with qualified mental health professionals across Canada and the US.",
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
