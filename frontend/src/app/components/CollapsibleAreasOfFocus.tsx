"use client";

import { useState, useRef, useEffect } from "react";

const CollapsibleAreasOfFocus = ({
  areasOfFocus,
}: {
  areasOfFocus: string[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialDisplayCount = 9;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(
        isExpanded
          ? contentRef.current.scrollHeight
          : (contentRef.current.children[0] as HTMLElement).offsetHeight
      );
    }
  }, [isExpanded, areasOfFocus]);

  if (!areasOfFocus?.length) {
    return <span className="text-gray-700">No areas of focus listed</span>;
  }

  const displayedAreasOfFocus = isExpanded
    ? areasOfFocus
    : areasOfFocus.slice(0, initialDisplayCount);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: height ? `${height}px` : "auto" }}
      >
        <div className="flex flex-wrap gap-2">
          {displayedAreasOfFocus.map((area) => (
            <span
              key={area}
              className="px-2 py-1 rounded-full text-sm border border-grey-dark"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
      {areasOfFocus.length > initialDisplayCount && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green hover:underline mt-2 transition-colors duration-200"
        >
          {isExpanded
            ? "Show less"
            : `Show ${areasOfFocus.length - initialDisplayCount} more`}
        </button>
      )}
    </div>
  );
};

export default CollapsibleAreasOfFocus;
