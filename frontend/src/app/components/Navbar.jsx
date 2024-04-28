"use client";

import Link from "next/link";
const Navbar = () => {
  // const Navbar = () => {
  return (
    <nav className="fixed z-10 top-0 bg-gray-50 text-gray-800 w-full p-4 grid grid-cols-3 items-center">
      <a href="/" className={`text-center`}>
        Home
      </a>
      <Link
        className="text-center hover:underline hover:underline-offset-2  hover:text-white p-2"
        href={"/"}
      >
        AI FOR EVERYONE
      </Link>

      <div className="flex gap-4">
        <Link className="hover:underline hover:underline-offset-2" href="/">
          Home 🏡{" "}
        </Link>
        <Link
          className="hover:underline hover:underline-offset-2"
          href="/tutorial"
        >
          Tutorial 🌈{" "}
        </Link>
        <Link
          className="hover:underline hover:underline-offset-2"
          href="/kitsune"
        >
          Kitsune 🦊{" "}
        </Link>
        <Link
          className="hover:underline hover:underline-offset-2"
          href="/mimir"
        >
          Mimir 🧙🏼{" "}
        </Link>
        {/* New Page: */}
        {/* E.g. For a new link to  app/newpage/page.jsx */}
        {/* <Link href="/[APP_FOLDER_NAME]">New Page 📄</Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
