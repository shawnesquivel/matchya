import React from "react";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { inter } from "./styles/fonts";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matchya | Therapist Finder",
  description:
    "Instantly connect with your ideal therapist using Matchya's AI-powered chat interface. Skip tedious searches and get personalized, empathetic matches tailored to your mental health needs.",
  icons: {
    icon: "/assets/images/favicon.png", // /public path
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <ClerkProvider appearance={{ cssLayerName: "clerk" }}>
      <html lang="en">
        <head>
          <link rel="stylesheet" href="https://use.typekit.net/vmx7tbu.css" />
          <script async src="https://tally.so/widgets/embed.js"></script>
          <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
          {/* Initialize dataLayer before GTM */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
              `,
            }}
          />
          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NWJVRJF5');`,
            }}
          />
          {/* End Google Tag Manager */}
        </head>
        <body className={`${inter.className} max-h-screen h-screen flex flex-col`}>
          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NWJVRJF5"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
          {/* End Google Tag Manager (noscript) */}

          {/* Clerk Authentication Header */}
          <header className="flex justify-between items-center p-4 border-b">
            <div className="text-xl font-bold">Matchya</div>
            <div className="flex gap-2">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>

          <main className="h-full flex flex-col">{children}</main>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
