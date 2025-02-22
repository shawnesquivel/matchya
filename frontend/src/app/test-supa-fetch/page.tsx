"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// load env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type TherapistSummary = {
  id: string;
  first_name: string;
  last_name: string;
  profile_img_url: string;
  bio: string;
  embedding: number[];
  fees: {
    session_category: string;
    session_type: string;
    price: number;
    currency: string;
  }[];
  ethnicity: string[];
};

const getEmbeddingSize = (embedding: any): number => {
  if (!embedding) return 0;
  return (typeof embedding === "string" ? JSON.parse(embedding) : embedding)
    .length;
};

const ETHNICITIES = [
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black" },
  { value: "hispanic", label: "Hispanic" },
  { value: "indigenous", label: "Indigenous" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "pacific_islander", label: "Pacific Islander" },
  { value: "white", label: "White" },
  { value: "multiracial", label: "Multiracial" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export default function TestPage() {
  const [therapists, setTherapists] = useState<TherapistSummary[]>([]);
  const [filters, setFilters] = useState({
    gender: "",
    ethnicity: [] as string[],
    maxPrice: 0,
  });

  const fetchTherapists = async () => {
    let query = supabase.from("therapists").select(`
        id,
        first_name,
        last_name,
        profile_img_url,
        bio,
        embedding,
        gender,
        ethnicity,
        therapist_fees!inner (
          session_category,
          session_type,
          price,
          currency
        )
      `);

    if (filters.gender) {
      query = query.eq("gender", filters.gender);
    }

    if (filters.ethnicity.length > 0) {
      query = query.contains("ethnicity", filters.ethnicity);
    }

    if (filters.maxPrice > 0) {
      // Use the foreign key relationship and filter on the joined table
      query = query.lte("therapist_fees.price", filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching therapists:", error);
      return;
    }

    setTherapists(
      data?.map(({ therapist_fees, ...therapist }) => ({
        ...therapist,
        fees: therapist_fees,
      })) || []
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Query</h1>

      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) =>
              setFilters((f) => ({ ...f, gender: e.target.value }))
            }
            className="border rounded p-2"
          >
            <option value="">All</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ethnicity</label>
          <div className="space-y-2">
            {ETHNICITIES.map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.ethnicity.includes(value)}
                  onChange={(e) => {
                    setFilters((f) => ({
                      ...f,
                      ethnicity: e.target.checked
                        ? [...f.ethnicity, value]
                        : f.ethnicity.filter((e) => e !== value),
                    }));
                  }}
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Max Price (${filters.maxPrice})
          </label>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
            }
            className="w-full"
          />
        </div>

        <button
          onClick={fetchTherapists}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Apply Filters & Fetch
        </button>
      </div>

      <div className="space-y-4">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="border p-4 rounded">
            <div className="flex gap-4">
              {therapist.profile_img_url && (
                <img
                  src={therapist.profile_img_url}
                  alt={`${therapist.first_name} ${therapist.last_name}`}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {therapist.first_name} {therapist.last_name}
                </h2>
                <div className="text-sm text-gray-600 mt-1">
                  Ethnicity:{" "}
                  {therapist.ethnicity
                    .map(
                      (e) => ETHNICITIES.find((eth) => eth.value === e)?.label
                    )
                    .join(", ")}
                </div>
                <p className="text-gray-600 mt-2">
                  {therapist.bio?.substring(0, 100)}...
                </p>
                <div className="mt-2">
                  <h3 className="font-semibold">Fees:</h3>
                  <ul className="list-disc list-inside">
                    {therapist.fees?.map((fee, i) => (
                      <li key={i}>
                        {fee.session_category} {fee.session_type}: {fee.price}{" "}
                        {fee.currency}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Embedding size: {getEmbeddingSize(therapist.embedding)}{" "}
                  dimensions
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
