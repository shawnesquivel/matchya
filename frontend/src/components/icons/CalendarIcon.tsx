import React from 'react';

interface CalendarIconProps {
  className?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ className = '' }) => {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.2001 2.2002H1.8001C1.13736 2.2002 0.600098 2.73745 0.600098 3.4002V11.8002C0.600098 12.4629 1.13736 13.0002 1.8001 13.0002H10.2001C10.8628 13.0002 11.4001 12.4629 11.4001 11.8002V3.4002C11.4001 2.73745 10.8628 2.2002 10.2001 2.2002Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3999 1V3.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.6001 1V3.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.600098 5.7998H11.4001"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CalendarIcon;
