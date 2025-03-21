"use client";

import React from "react";
import Link from "next/link";

interface Breadcrumb {
  name: string;
  href: string;
}

export default function DirectoryBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  // Always show first and last breadcrumbs
  const firstBreadcrumb = breadcrumbs[0];
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const hasIntermediateLinks = breadcrumbs.length > 2;

  return (
    <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
        {/* First breadcrumb - always visible */}
        <li className="inline-flex items-center">
          <Link
            href={firstBreadcrumb.href}
            className="inline-flex items-center text-sm font-medium animated-link text-green hover:text-green-dark"
          >
            {firstBreadcrumb.name}
          </Link>
        </li>

        {/* Mobile ellipsis for intermediate breadcrumbs */}
        {hasIntermediateLinks && (
          <li className="inline-flex items-center md:hidden">
            <svg
              className="w-3 h-3 mx-1 text-grey-extraDark"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <span className="text-sm text-grey-extraDark mx-1">...</span>
          </li>
        )}

        {/* Intermediate breadcrumbs - hidden on mobile */}
        {breadcrumbs.slice(1, -1).map((breadcrumb) => (
          <li key={breadcrumb.href} className="hidden md:inline-flex items-center">
            <svg
              className="w-3 h-3 mx-1 text-grey-extraDark"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <Link
              href={breadcrumb.href}
              className="inline-flex items-center text-sm font-medium animated-link text-green hover:text-green-dark"
            >
              {breadcrumb.name}
            </Link>
          </li>
        ))}

        {/* Last breadcrumb - always visible */}
        {breadcrumbs.length > 1 && (
          <li className="inline-flex items-center">
            <svg
              className="w-3 h-3 mx-1 text-grey-extraDark"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <Link
              href={lastBreadcrumb.href}
              className="inline-flex items-center text-sm font-medium text-grey-extraDark"
              aria-current="page"
            >
              {lastBreadcrumb.name}
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
}
