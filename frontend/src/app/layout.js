import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { inter } from "./styles/fonts";
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
          <link rel="stylesheet" href="https://use.typekit.net/vmx7tbu.css" />
          <script async src="https://tally.so/widgets/embed.js"></script>
          <script
            async
            src="https://js.stripe.com/v3/pricing-table.js"
          ></script>
          {/* Initialize dataLayer before GTM */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
              `
            }}
          />
          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NWJVRJF5');`
            }}
          />
          {/* End Google Tag Manager */}
        </head>
        <body className={`${inter.className} max-h-screen h-screen flex flex-col`}>
          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NWJVRJF5"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`
            }}
          />
          {/* End Google Tag Manager (noscript) */}
          <main className="h-full flex flex-col">{children}</main>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
