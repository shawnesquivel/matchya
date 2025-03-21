"use client";

import React from "react";
import Link from "next/link";

interface Breadcrumb {
  name: string;
  href: string;
}

export default function DirectoryBreadcrumbs({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 mx-1 text-gray-400"
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
            )}
            <Link
              href={breadcrumb.href}
              className={`inline-flex items-center text-sm font-medium ${
                index === breadcrumbs.length - 1
                  ? "text-gray-500"
                  : "text-blue-600 hover:text-blue-700"
              }`}
              aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
            >
              {breadcrumb.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
