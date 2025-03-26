"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CheckTherapistDataPage() {
  const [slug, setSlug] = useState("sarah-lee-4322da");
  const [therapistData, setTherapistData] = useState<any>(null);
  const [promptsData, setPromptsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClientComponentClient();

  async function fetchData() {
    setIsLoading(true);
    setError("");
    try {
      // First get the therapist ID from the slug
      const { data: therapist, error: therapistError } = await supabase
        .from("therapists")
        .select("*")
        .eq("slug", slug)
        .single();

      if (therapistError) throw therapistError;
      if (!therapist) throw new Error("Therapist not found");

      setTherapistData(therapist);

      // Then get their prompts
      const { data: prompts, error: promptsError } = await supabase
        .from("therapist_prompts")
        .select("*")
        .eq("therapist_id", therapist.id);

      if (promptsError) throw promptsError;

      setPromptsData(prompts || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching therapist data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Check Therapist Database Data</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Therapist slug"
          />

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Fetch Data"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {therapistData && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Therapist Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium bg-gray-50">ID</td>
                  <td className="py-2 px-4">{therapistData.id}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium bg-gray-50">Name</td>
                  <td className="py-2 px-4">
                    {therapistData.first_name} {therapistData.last_name}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium bg-gray-50">Slug</td>
                  <td className="py-2 px-4">{therapistData.slug}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {promptsData && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Prompts Data ({promptsData.length})</h2>

          {promptsData.length === 0 ? (
            <p className="text-gray-500 italic">No prompts found for this therapist</p>
          ) : (
            <div className="space-y-4">
              {promptsData.map((prompt, index) => (
                <div key={prompt.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">Prompt #{index + 1}</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Prompt:</span>
                      <p className="mt-1">{prompt.prompt}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Answer:</span>
                      <p className="mt-1">{prompt.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
