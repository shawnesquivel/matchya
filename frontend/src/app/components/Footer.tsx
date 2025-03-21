import React from "react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-beige-extralight border-t border-grey-light py-2 ${className}`}>
      <div className="px-4 text-left">
        <p className="text-xs text-grey-medium">© {currentYear} Matchya. All rights reserved.</p>
      </div>
    </footer>
  );
}
