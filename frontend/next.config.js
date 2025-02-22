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
    domains: [
      "assets-jane-cac1-20.janeapp.net",
      "assets-jane-cac1-21.janeapp.net",
      "www.peak-resilience.com",
      "assets-jane-cac1-22.janeapp.net",
      "assets-jane-cac1-23.janeapp.net",
      "assets-jane-cac1-24.janeapp.net",
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
