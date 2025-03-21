import React, { useEffect, useRef } from "react";

interface HighlightProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  animationDelay?: number;
  strokeWidth?: number;
  padding?: number;
}

export default function Highlight({
  children,
  color = "#C9D356", // Default to light green
  className = "",
  animationDelay = 0,
  strokeWidth = 2,
  padding = 8,
}: HighlightProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Adjust the SVG size based on the container size
    const resizeCircle = () => {
      if (containerRef.current && svgRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();

        // Set the SVG size to encompass the text with padding
        const svgWidth = width + padding * 2;
        const svgHeight = height + padding * 2;

        svgRef.current.setAttribute("width", `${svgWidth}px`);
        svgRef.current.setAttribute("height", `${svgHeight}px`);

        // Adjust the circle size
        const circleElem = svgRef.current.querySelector("circle");
        if (circleElem) {
          const radius = Math.max(width, height) / 2 + padding;
          circleElem.setAttribute("r", `${radius}`);

          // Update the stroke-dasharray to match the new circumference
          const circumference = 2 * Math.PI * radius;
          circleElem.setAttribute("stroke-dasharray", `${circumference}`);
          circleElem.setAttribute("stroke-dashoffset", `${circumference}`);
        }
      }
    };

    // Initial sizing
    resizeCircle();

    // Listen for window resize
    window.addEventListener("resize", resizeCircle);

    return () => {
      window.removeEventListener("resize", resizeCircle);
    };
  }, [padding]);

  return (
    <span ref={containerRef} className={`highlight-circle-container ${className}`}>
      {children}
      <svg
        ref={svgRef}
        className="highlight-circle"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          animationDelay: `${animationDelay}ms`,
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth={strokeWidth}
          style={{
            animationDelay: `${animationDelay}ms`,
          }}
        />
      </svg>
    </span>
  );
}
