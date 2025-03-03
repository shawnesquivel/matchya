"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

// Ensure we handle environment switching for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Using Supabase URL:", supabaseUrl);

// Create a single supabase client for the entire session
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Therapist = {
  first_name: string;
  last_name: string;
  gender: "female" | "male" | "non_binary";
  pronouns: string;
  ethnicity: (
    | "asian"
    | "black"
    | "hispanic"
    | "indigenous"
    | "middle_eastern"
    | "pacific_islander"
    | "white"
    | "multiracial"
    | "prefer_not_to_say"
  )[];
  sexuality: (
    | "straight"
    | "gay"
    | "lesbian"
    | "bisexual"
    | "queer"
    | "pansexual"
    | "asexual"
    | "questioning"
    | "prefer_not_to_say"
  )[];
  faith: (
    | "agnostic"
    | "atheist"
    | "buddhist"
    | "christian"
    | "hindu"
    | "jewish"
    | "muslim"
    | "sikh"
    | "spiritual"
    | "other"
    | "prefer_not_to_say"
  )[];
  profile_img_url: string;
  video_intro_link: string;
  clinic_profile_url: string;
  therapist_email: string;
  clinic_name: string;
  clinic_street: string;
  clinic_city: string;
  clinic_province: string;
  clinic_postal_code: string;
  clinic_country: string;
  availability: "online" | "in_person" | "both";
  education: string[];
  certifications: string[];
  approaches: {
    long_term: string[];
    short_term?: string[];
  };
  areas_of_focus: string[];
  languages: string[];
  bio: string;
  ai_summary: string;
  is_verified: boolean;
};

// Define license type enum to match database
type LicenseTitle = "RCC" | "RSW" | "RP" | "CPsych" | "MFT" | "RPN" | "MD";
type JurisdictionType =
  | "BC"
  | "ON"
  | "AB"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "PE"
  | "QC"
  | "SK"
  | "YT"
  | "NY"
  | "CA"
  | "IL"
  | "TX"
  | "AZ"
  | "PA";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Shared clinic and professional data
  const sharedData = {
    clinic_name: "Peak Resilience",
    clinic_street: "1111 Melville St #589",
    clinic_city: "Vancouver",
    clinic_province: "BC",
    clinic_postal_code: "V6E 3V6",
    clinic_country: "CA",
    clinic_profile_url: "https://www.peak-resilience.com/",
    video_intro_link: "https://www.youtube.com/watch?v=3fxY_qyl1Oo",
    availability: "both" as const,
    certifications: ["Crime Victim Assistance Program (CVAP) Approved"],
    is_verified: false,
  };

  // Three diverse therapists with different identities
  const therapists: Therapist[] = [
    {
      ...sharedData,
      first_name: "Shiho",
      last_name: "Hayashi",
      gender: "female",
      pronouns: "she/her",
      ethnicity: ["asian"],
      sexuality: ["straight"],
      faith: ["buddhist"],
      profile_img_url:
        "https://www.peak-resilience.com/wp-content/uploads/2024/02/IMG_2916-1024x678.jpg",
      therapist_email: "shiho@peakresilience.ca",
      education: ["Business Degree", "MA in Counselling Psychology"],
      approaches: {
        long_term: [
          "Acceptance and Commitment Therapy (ACT)",
          "Trauma Informed Therapy",
          "Somatic Experiencing",
          "Sensorimotor Therapy",
        ],
      },
      areas_of_focus: ["Anxiety", "Boundary Setting", "Break-Ups", "Trauma"],
      languages: ["English", "Japanese"],
      ai_summary:
        "A compassionate therapist specializing in trauma-informed care, dedicated to helping clients navigate emotional challenges through somatic and ACT approaches.",
      bio: `Hi! I'm an RCC at Peak Resilience. I grew up in Japan before moving to Canada, which gives me a unique perspective on cultural challenges. My personal mental health journey inspired me to shift from business to mental health counselling. I've faced challenges navigating cultural expectations and understand the darkness that can feel overwhelming.

My approach integrates mind and body through a client-centered, trauma-informed lens. I often use Acceptance and Commitment Therapy (ACT) to work with emotions rather than against them. Somatic, body-based methods are also central to my practice. I believe therapy should balance the difficult times with light, integrating compassion, values-based work, and cultural sensitivity throughout our journey.`,
    },
    {
      ...sharedData,
      first_name: "Tyra",
      last_name: "Banks",
      gender: "female",
      pronouns: "she/her",
      ethnicity: ["black"],
      sexuality: ["straight"],
      faith: ["christian"],
      profile_img_url:
        "https://www.peak-resilience.com/wp-content/uploads/2022/10/Sydney_2022.jpg",
      therapist_email: "tyra@peakresilience.ca",
      education: ["MSW", "PhD in Clinical Psychology"],
      approaches: {
        long_term: [
          "Cognitive Behavioral Therapy (CBT)",
          "Trauma Informed Therapy",
          "Intersectional Feminist Therapy",
        ],
        short_term: ["Solution-Focused Therapy"],
      },
      areas_of_focus: ["Depression", "Anxiety", "Racial Trauma", "Identity"],
      languages: ["English", "French"],
      ai_summary:
        "A skilled therapist with expertise in CBT and trauma-informed care, bringing an intersectional perspective to support clients through racial trauma and identity exploration.",
      bio: `I'm a clinical psychologist with experience supporting clients through racial trauma and identity challenges. My approach combines evidence-based practices with cultural sensitivity and an awareness of systemic factors affecting mental health.

I believe in creating a safe space where all parts of your identity are honored and understood. Having navigated my own journey with racial identity and mental health, I'm passionate about supporting others on similar paths. My therapeutic relationship is built on authenticity, trust, and a commitment to seeing you as a whole person - not just your challenges.

I use CBT techniques while recognizing the importance of social context and cultural factors. Together, we'll work toward healing that acknowledges both your internal world and external realities.`,
    },
    {
      ...sharedData,
      first_name: "Alex",
      last_name: "Rivera",
      gender: "non_binary",
      pronouns: "they/them",
      ethnicity: ["hispanic", "indigenous"],
      sexuality: ["queer", "pansexual"],
      faith: ["spiritual"],
      profile_img_url:
        "https://www.peak-resilience.com/wp-content/uploads/2023/01/Suki_2022-683x1024.jpg",
      therapist_email: "alex@peakresilience.ca",
      education: ["MA in Clinical Mental Health Counseling"],
      approaches: {
        long_term: [
          "Narrative Therapy",
          "Queer Theory Informed Practice",
          "Mindfulness-Based Therapy",
        ],
        short_term: ["Crisis Intervention"],
      },
      areas_of_focus: [
        "LGBTQ+ Issues",
        "Gender Identity",
        "Cultural Displacement",
        "Spirituality",
      ],
      languages: ["English", "Spanish"],
      ai_summary:
        "A compassionate non-binary therapist specializing in identity-affirming care, supporting clients through gender exploration, cultural displacement, and spiritual journeys.",
      bio: `As a non-binary therapist with multicultural roots, I bring both professional training and lived experience to my practice. I specialize in working with LGBTQ+ clients, particularly those exploring gender identity or navigating the intersection of queerness with cultural and spiritual identities.

My approach centers on narrative therapy, helping clients reclaim their stories and envision new possibilities. I believe in honoring both ancestral wisdom and queer futurism in my practice. Having navigated my own journey with gender, cultural displacement, and spirituality, I create a space where all facets of identity are welcomed and affirmed.

I'm passionate about supporting clients through life transitions, identity exploration, and healing from marginalization-based trauma. Our work together will acknowledge both individual healing and the reality of systemic factors, balancing personal growth with community connection.`,
    },
  ];

  const insertTherapists = async () => {
    setLoading(true);
    setResult("");
    let successCount = 0;

    try {
      for (const therapistData of therapists) {
        // Insert therapist
        const { data: therapist, error } = await supabase
          .from("therapists")
          .insert(therapistData)
          .select()
          .single();

        if (error) {
          console.error("Error inserting therapist:", error);
          setResult(
            (prev) =>
              prev +
              `\nError inserting ${therapistData.first_name}: ${error.message}`
          );
          continue;
        }

        // Insert license
        const { error: licenseError } = await supabase
          .from("therapist_licenses")
          .insert({
            therapist_id: therapist.id,
            license_number: "20480",
            state: "BC" as JurisdictionType,
            title: "RCC" as LicenseTitle,
            issuing_body: "BCACC",
            is_verified: false,
          });

        if (licenseError) {
          console.error("Error inserting license:", licenseError);
          setResult(
            (prev) =>
              prev +
              `\nError inserting license for ${therapistData.first_name}: ${licenseError.message}`
          );
          continue;
        }

        // Insert fees
        const { error: feeError } = await supabase
          .from("therapist_fees")
          .insert([
            {
              therapist_id: therapist.id,
              session_category: "initial",
              session_type: "individual",
              delivery_method: "in_person",
              duration_minutes: 50,
              price: 150.0,
              currency: "CAD",
            },
            {
              therapist_id: therapist.id,
              session_category: "subsequent",
              session_type: "individual",
              delivery_method: "in_person",
              duration_minutes: 50,
              price: 130.0,
              currency: "CAD",
            },
            {
              therapist_id: therapist.id,
              session_category: "initial",
              session_type: "couples",
              delivery_method: "in_person",
              duration_minutes: 80,
              price: 180.0,
              currency: "CAD",
            },
            {
              therapist_id: therapist.id,
              session_category: "subsequent",
              session_type: "couples",
              delivery_method: "in_person",
              duration_minutes: 80,
              price: 160.0,
              currency: "CAD",
            },
          ]);

        if (feeError) {
          console.error("Error inserting fees:", feeError);
          setResult(
            (prev) =>
              prev +
              `\nError inserting fees for ${therapistData.first_name}: ${feeError.message}`
          );
          continue;
        }

        successCount++;
        setResult(
          (prev) =>
            prev +
            `\nSuccessfully inserted ${therapistData.first_name} ${therapistData.last_name}`
        );
      }

      setResult(
        (prev) =>
          `${successCount} of ${therapists.length} therapists inserted successfully.` +
          prev
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      setResult((prev) => prev + `\nUnexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Therapist Upload</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-700 mb-2">
          This will upload 3 test therapists with different identities to your
          database.
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {therapists.map((t, index) => (
            <li key={index}>
              {t.first_name} {t.last_name} ({t.pronouns}):{" "}
              {t.ethnicity.join(", ")} | Faith: {t.faith.join(", ")} |
              Sexuality: {t.sexuality.join(", ")}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={insertTherapists}
        disabled={loading}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Uploading..." : "Upload All Therapists"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded max-h-60 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}
