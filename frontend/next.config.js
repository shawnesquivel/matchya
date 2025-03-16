/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
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
        hostname: "open_space_counselling.ca",
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
        hostname: "ayoua.com",
      },
      {
        protocol: "https",
        hostname: "repiphany.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
