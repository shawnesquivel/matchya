import Link from "next/link";

export default function TherapistNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <h1 className="text-3xl font-semibold mb-4 text-center">Therapist Not Found</h1>
      <p className="text-center text-gray-600 mb-8 max-w-md">
        We couldn't find the therapist you're looking for. They may have moved or the profile
        doesn't exist.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/therapists/browse"
          className="px-6 py-3 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition duration-300"
        >
          Browse All Therapists
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
