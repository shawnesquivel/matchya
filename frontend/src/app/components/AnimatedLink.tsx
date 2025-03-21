import React from "react";

interface AnimatedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
}

export default function AnimatedLink({ children, className = "", ...props }: AnimatedLinkProps) {
  return (
    <a className={`group relative inline-block ${className}`} {...props}>
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
    </a>
  );
}
