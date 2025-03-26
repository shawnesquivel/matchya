"use client";

import { useState } from "react";
import { revalidateTherapistPage } from "../actions";

export default function RevalidatePage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form values
  const [country, setCountry] = useState("ca");
  const [region, setRegion] = useState("bc");
  const [slug, setSlug] = useState("sarah-lee-4322da");

  async function handleRevalidate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await revalidateTherapistPage(country, region, slug);
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Revalidate Therapist Page</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form onSubmit={handleRevalidate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Country Code</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value.toLowerCase())}
              className="w-full p-2 border rounded"
              placeholder="ca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Region Code</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value.toLowerCase())}
              className="w-full p-2 border rounded"
              placeholder="bc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Therapist Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="therapist-slug"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Revalidating..." : "Revalidate Page"}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h2 className="text-lg font-medium mb-2">Result</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.success && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Page has been revalidated. You should now see the updated content.
              </p>
              <a
                href={`/therapists/${country}/${region}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Visit Page
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
