import { useTherapist } from "../contexts/TherapistContext";

export default function LocationDisplay({
  handleResetLocation,
}: {
  handleResetLocation: () => void;
}) {
  const { filters } = useTherapist();

  // Combine city and province for display
  const displayLocation =
    filters?.clinic_city && filters?.clinic_province
      ? `${filters.clinic_city}, ${filters.clinic_province}`
      : "Online Only";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-grey-medium sm:block hidden">Location Selected:</span>
      <button
        onClick={handleResetLocation}
        className="flex items-center gap-1 px-2 py-2 border border-grey-light rounded-full bg-beige text-xs text-mblack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="truncate max-w-[100px]">{displayLocation}</span>
      </button>
    </div>
  );
}
