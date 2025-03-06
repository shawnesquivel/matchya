import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Therapist Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the therapist you're looking for. They may have moved
          or the profile may no longer exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
