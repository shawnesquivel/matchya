"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

// load env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing environment variables");
}

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
  licenses: Array<{
    license_number: string;
    state: string;
    type: string;
    organization: string;
  }>;
  bio: string;
  ai_summary: string;
};

export default function TestPage() {
  const [formData, setFormData] = useState({
    first_name: "Shiho",
    last_name: "Hayashi",
    ethnicity: ["asian"] as Therapist["ethnicity"],
  });

  const insertTherapist = async () => {
    const therapistData: Therapist = {
      ...formData,
      gender: "female",
      pronouns: "she/her",
      profile_img_url:
        "https://www.peak-resilience.com/wp-content/uploads/2024/02/IMG_2916-1024x678.jpg",
      video_intro_link: "https://www.youtube.com/watch?v=3fxY_qyl1Oo",
      ai_summary:
        "A compassionate therapist specializing in trauma-informed care, dedicated to helping clients navigate their emotional challenges and achieve personal growth.",
      clinic_profile_url: "https://www.peak-resilience.com/",
      therapist_email: "hello@elementaltherapy.ca",
      clinic_name: "Peak Resilience",
      clinic_street: "1111 Melville St #589",
      clinic_city: "Vancouver",
      clinic_province: "BC",
      clinic_postal_code: "V6E 3V6",
      clinic_country: "CA",
      availability: "both",
      education: ["Business Degree"],
      certifications: ["Crime Victim Assistance Program (CVAP) Approved"],
      approaches: {
        long_term: [
          "Acceptance and Commitment Therapy (ACT)",
          "Trauma Informed Therapy",
          "Somatic Experiencing + Sensorimotor Therapy",
          "Intersectional Feminist Therapy",
        ],
      },
      areas_of_focus: ["Anxiety", "Boundary Setting", "Break-Ups", "Trauma"],
      languages: ["English"],
      licenses: [
        {
          license_number: "20480",
          state: "BC",
          type: "Registered Clinical Counsellor",
          organization: "BCACC",
        },
      ],
      bio: `Hi! I'm an RCC at Peak. I grew up in Saskatoon and earned a business degree, which helped me in leadership roles with value-aligned companies. My personal mental health journey and the need for quality care inspired me to shift my career focus to mental health. I've faced my own challenges and understand the darkness that can feel overwhelming. But I assure you, things can improve, and life can be beautiful.

If you're seeking a therapist who provides insight and supports positive change, I might be a great fit. My approach integrates mind and body through a client-centered, trauma-informed, and anti-oppressive lens. I offer individual and relationship therapy, both virtually and in person, including nature-based sessions. I often use Acceptance and Commitment Therapy (ACT) to work with emotions rather than against them. Somatic, body-based methods are also central to my practice, as I believe our bodies hold wisdom that cognitive approaches may overlook. As a relationship therapist, I primarily use the Gottman Method to foster shared meaning and understanding while navigating emotions and conflict.

I understand that seeking support can evoke many emotions, and I prioritize building an authentic, trusting, and safe relationship. Recognizing that no two individuals are alike, we will customize your therapy together. I believe therapy should balance the dark times with light, integrating compassion, values-based work, and humor throughout our journey. You're not alone in this, and I look forward to meeting you and walking alongside you during this chapter of your life.`,
    };

    const { data: therapist, error } = await supabase
      .from("therapists")
      .insert(therapistData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting therapist:", error);
      return;
    }

    // Then insert fees
    const { error: feeError } = await supabase.from("therapist_fees").insert([
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
      return;
    }

    console.log("Successfully inserted therapist and fees!");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Insert</h1>

      <form className="space-y-4 mb-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, first_name: e.target.value }))
            }
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, last_name: e.target.value }))
            }
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Ethnicity</label>
          <select
            value={formData.ethnicity[0]}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                ethnicity: [e.target.value as Therapist["ethnicity"][0]],
              }))
            }
            className="border p-2 rounded"
          >
            <option value="asian">Asian</option>
            <option value="black">Black</option>
            <option value="hispanic">Hispanic</option>
            <option value="indigenous">Indigenous</option>
            <option value="middle_eastern">Middle Eastern</option>
            <option value="pacific_islander">Pacific Islander</option>
            <option value="white">White</option>
            <option value="multiracial">Multiracial</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </form>

      <button
        onClick={insertTherapist}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Insert Test Therapist
      </button>
    </div>
  );
}
