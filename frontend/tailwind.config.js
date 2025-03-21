/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          extralight: "#BCBD88",
          light: "#C9D356",
          DEFAULT: "#466421",
          dark: "#365216",
        },
        mblack: {
          DEFAULT: "#2A1410",
        },
        purple: {
          DEFAULT: "#E8D7EA",
          dark: "#C9B7D3",
        },
        blue: {
          light: "#CCD6DF",
          dark: "#B7C7D5",
          DEFAULT: "#E8D7EA",
        },
        white: {
          DEFAULT: "#FDFDFD",
          dark: "#F6F5F1",
        },
        grey: {
          DEFAULT: "#F7F7F7",
          dark: "#E3E3E3",
          light: "#E9E9E9",
          medium: "#666359",
          extraDark: "#878787",
        },
        beige: {
          xxl: "#FFFDFA",
          extralight: "#FAF9F7",
          light: "#F8F8F2",
          dark: "#DDDBD3",
          DEFAULT: "#F6F5F1",
        },
        orange: {
          DEFAULT: "#F3843C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        'new-spirit': ['new-spirit', 'serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        slideIn: "slideIn 0.3s ease-out",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};
