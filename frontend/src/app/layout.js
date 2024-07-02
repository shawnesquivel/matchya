import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { instrumentSans } from "./styles/fonts";

export const metadata = {
  title: "matchya",
  description: "find your ideal therapist, without the hassle.",
  icons: {
    icon: "/assets/images/favicon.png", // /public path
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={instrumentSans.className}>
        <main className="flex flex-col pt-20 px-20">{children}</main>
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
