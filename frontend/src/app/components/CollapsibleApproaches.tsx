"use client";

import { useState, useRef, useEffect } from "react";

const CollapsibleApproaches = ({ approaches }: { approaches: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialDisplayCount = 5;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(
        isExpanded
          ? contentRef.current.scrollHeight
          : (contentRef.current.children[0] as HTMLElement).offsetHeight
      );
    }
  }, [isExpanded, approaches]);

  if (!approaches?.length) {
    return <span className="text-gray-700">No approaches listed</span>;
  }

  const displayedApproaches = isExpanded ? approaches : approaches.slice(0, initialDisplayCount);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div className="flex flex-wrap gap-2">
          {displayedApproaches.map((approach) => (
            <span key={approach} className="px-2 py-1 rounded-full text-sm border border-grey-dark">
              {approach}
            </span>
          ))}
        </div>
      </div>
      {approaches.length > initialDisplayCount && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green hover:underline mt-2 transition-colors duration-200"
        >
          {isExpanded ? "Show less" : `Show ${approaches.length - initialDisplayCount} more`}
        </button>
      )}
    </div>
  );
};

export default CollapsibleApproaches;
