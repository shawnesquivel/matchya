import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
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
        <body className={`flex flex-col ${aspekta.className}`}>
          <main className="min-h-screen">{children}</main>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
