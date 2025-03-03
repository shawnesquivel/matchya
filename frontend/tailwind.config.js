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
          extralight: '#BCBD88',
          light: '#C9D356',
          DEFAULT: '#466421',
        },
        mblack: {
          DEFAULT: '#2A1410',
        },
        purple: {
          DEFAULT: '#E8D7EA',
        },        blue: {
          light: '#CCD6DF',
          dark: '#B7C7D5',
        },
        white: {
          DEFAULT: '#FDFDFD',
          dark: '#F6F5F1',
        },
        grey: {
          DEFAULT: '#F7F7F7',
          dark: '#E3E3E3',
          medium: '#666359',
          extraDark: '#878787',
        },
        beige: {
          xxl: '#FFFDFA',
          extralight: '#FAF9F7',
          light: '#F8F8F2',
          dark: '#DDDBD3',
          DEFAULT: '#F6F5F1',
        },       
        orange: {
          DEFAULT: '#F3843C',
        },       
      },
      fontFamily: {
        'tuppence': ['tuppence', 'serif'],
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
