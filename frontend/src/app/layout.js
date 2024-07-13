import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Footer from "./components/Footer";
import { aspekta } from "./styles/fonts";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "matchya",
  description: "find your ideal therapist, without the hassle.",
  icons: {
    icon: "/assets/images/favicon.png", // /public path
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script async src="https://tally.so/widgets/embed.js"></script>
        </head>
        <body className={`flex flex-col h-screen ${aspekta.className}`}>
          <main className="bg-grey gap-2 flex flex-col px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 h-full ">
            {children}
          </main>
          <Analytics />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
