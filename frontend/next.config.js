/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  images: {
    //  use GetImageDomains from Supabase.SQL-Editor
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets-jane-cac1-20.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "assets-jane-cac1-21.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "peak-resilience.com",
      },
      {
        protocol: "https",
        hostname: "www.peak-resilience.com",
      },
      {
        protocol: "https",
        hostname: "assets-jane-cac1-22.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "assets-jane-cac1-23.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "assets-jane-cac1-24.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "assets-jane-cac1-36.janeapp.net",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "thrivedowntown.com",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "openspacecounselling.ca",
      },
      {
        protocol: "https",
        hostname: "skylarkclinic.ca",
      },
      {
        protocol: "https",
        hostname: "lotustherapy.ca",
      },
      {
        protocol: "https",
        hostname: "blueskywellnessclinic.ca",
      },
      {
        protocol: "https",
        hostname: "www.blueskywellnessclinic.ca",
      },
      {
        protocol: "https",
        hostname: "ayoua.com",
      },
      {
        protocol: "https",
        hostname: "eastvancouvercounselling.ca",
      },
      {
        protocol: "https",
        hostname: "arccounselling.ca",
      },
      {
        protocol: "https",
        hostname: "clearheartcounselling.com",
      },
      {
        protocol: "https",
        hostname: "gatherandground.ca",
      },
      {
        protocol: "https",
        hostname: "chromacounselling.ca",
      },
      {
        protocol: "https",
        hostname: "wellspringcounselling.ca",
      },
      {
        protocol: "https",
        hostname: "fieldworkcounselling.ca",
      },
      {
        protocol: "https",
        hostname: "freemindtherapy.ca",
      },
      {
        protocol: "https",
        hostname: "bewellclinics.ca",
      },
      {
        protocol: "https",
        hostname: "healingrootstherapy.ca",
      },
      {
        protocol: "https",
        hostname: "providencetherapybc.com",
      },
      {
        protocol: "https",
        hostname: "vancouvercounsellingclinic.ca",
      },
      {
        protocol: "https",
        hostname: "jerichocounselling.com",
      },
      {
        protocol: "https",
        hostname: "benchmarkcounselling.com",
      },
      {
        protocol: "https",
        hostname: "richmondcounselling.com",
      },
      {
        protocol: "https",
        hostname: "panoramawellness.ca",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "abbotsford.skylarkclinic.ca",
      },
      {
        protocol: "https",
        hostname: "cdn-hhfkf.nitrocdn.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "repiphany.com",
      },
      {
        protocol: "https",
        hostname: "vancouvercounsellingclinic.com",
      },
      {
        protocol: "https",
        hostname: "hippo-ai-public-assets.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mlddlxmupu0y.i.optimole.com",
      },
      {
        protocol: "https",
        hostname: "photos.psychologytoday.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_FUNCTION_URL:
      process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
      "http://localhost:54321/functions/v1/openai-service",
  },
};

module.exports = nextConfig;
