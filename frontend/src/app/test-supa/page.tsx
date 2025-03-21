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
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [therapistQueryLoading, setTherapistQueryLoading] = useState(false);
  const [therapistQueryResult, setTherapistQueryResult] = useState<
    any[] | null
  >(null);
  const [therapistQueryError, setTherapistQueryError] = useState<string | null>(
    null
  );

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

  const queryAllTherapists = async () => {
    setTherapistQueryLoading(true);
    setTherapistQueryResult(null);
    setTherapistQueryError(null);

    try {
      // Query all therapists
      const { data, error } = await supabase
        .from("therapists")
        .select(
          `
          *,
          therapist_licenses(*),
          therapist_fees(*)
        `
        )
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      setTherapistQueryResult(data);
      console.log("Retrieved therapists:", data);
    } catch (err) {
      console.error("Error querying therapists:", err);
      setTherapistQueryError(err instanceof Error ? err.message : String(err));
    } finally {
      setTherapistQueryLoading(false);
    }
  };

  const generateRandomTherapist = () => {
    // Random data generators
    const getRandomElement = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)];
    const getRandomElements = (arr: any[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Name data
    const firstNames = [
      "Emma",
      "Olivia",
      "Ava",
      "Sophia",
      "Isabella",
      "Charlotte",
      "Amelia",
      "Mia",
      "Harper",
      "Evelyn",
      "Liam",
      "Noah",
      "William",
      "James",
      "Oliver",
      "Benjamin",
      "Elijah",
      "Lucas",
      "Mason",
      "Logan",
      "Aiden",
      "Jackson",
      "Raj",
      "Priya",
      "Mohammed",
      "Fatima",
      "Chen",
      "Mei",
      "Hiroshi",
      "Yuki",
      "Jamal",
      "Aisha",
      "Diego",
      "Sofia",
      "Arjun",
      "Zara",
    ];

    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Hernandez",
      "Lopez",
      "Gonzalez",
      "Wilson",
      "Anderson",
      "Thomas",
      "Taylor",
      "Moore",
      "Jackson",
      "Martin",
      "Lee",
      "Perez",
      "Thompson",
      "White",
      "Harris",
      "Sanchez",
      "Clark",
      "Ramirez",
      "Lewis",
      "Robinson",
      "Patel",
      "Khan",
      "Wong",
      "Kim",
      "Singh",
      "Gupta",
      "Chen",
      "Shah",
      "Ahmed",
      "Nguyen",
    ];

    // Identity data
    const genders = ["female", "male", "non_binary"];
    const pronounsList = [
      "she/her",
      "he/him",
      "they/them",
      "she/they",
      "he/they",
    ];

    // Location data
    const cities = [
      "Toronto",
      "Vancouver",
      "Montreal",
      "Calgary",
      "Ottawa",
      "Edmonton",
      "Winnipeg",
      "Quebec City",
      "Hamilton",
      "Kitchener",
      "London",
      "Victoria",
      "Halifax",
    ];

    const provinces = ["ON", "BC", "QC", "AB", "NS", "MB", "SK", "NB"];

    // Professional data
    const educationOptions = [
      "M.A. in Counselling Psychology",
      "Master of Social Work",
      "Ph.D. in Clinical Psychology",
      "M.A. in Marriage and Family Therapy",
      "Master of Counselling",
      "Doctor of Psychology",
      "Bachelor of Social Work",
      "M.Sc. in Mental Health",
      "Master of Arts in Psychology",
    ];

    const certificationOptions = [
      "Certified in Cognitive Behavioral Therapy",
      "EMDR Certified",
      "Gottman Method Certified",
      "Certified Trauma Specialist",
      "Emotionally Focused Therapy Certified",
      "Mindfulness-Based Stress Reduction Certified",
      "Dialectical Behavior Therapy Certified",
      "Certified Addiction Counselor",
      "Solution-Focused Brief Therapy Certified",
    ];

    const approachOptions = [
      "Cognitive Behavioral Therapy (CBT)",
      "Psychodynamic Therapy",
      "Person-Centered Therapy",
      "Dialectical Behavior Therapy (DBT)",
      "Mindfulness-Based Therapy",
      "Solution-Focused Brief Therapy",
      "Narrative Therapy",
      "Emotionally Focused Therapy",
      "Acceptance and Commitment Therapy",
      "Interpersonal Therapy",
      "Gestalt Therapy",
      "Psychoanalytic Therapy",
      "Existential Therapy",
      "Trauma-Focused Therapy",
      "Motivational Interviewing",
    ];

    const areasFocusOptions = [
      "Anxiety",
      "Depression",
      "Trauma",
      "PTSD",
      "Grief",
      "Relationships",
      "Family Issues",
      "Parenting",
      "Stress Management",
      "Life Transitions",
      "Career Counseling",
      "Self-Esteem",
      "Identity",
      "Sexuality",
      "LGBTQ+ Issues",
      "Addiction",
      "Substance Abuse",
      "Eating Disorders",
      "Bipolar Disorder",
      "Personality Disorders",
      "OCD",
      "ADHD",
      "Autism",
      "Emotional Regulation",
    ];

    const languageOptions = [
      "English",
      "French",
      "Spanish",
      "Mandarin",
      "Cantonese",
      "Punjabi",
      "Hindi",
      "Urdu",
      "Arabic",
      "Portuguese",
      "Italian",
      "German",
      "Korean",
      "Tagalog",
      "Vietnamese",
      "Russian",
      "Ukrainian",
      "Polish",
      "ASL",
    ];

    // License data
    const licenseTypes = [
      "RCC",
      "RSW",
      "RP",
      "CPsych",
      "MFT",
      "RPN",
      "MD",
      "MC",
      "MSW",
      "RTC",
    ];
    const jurisdictions = ["ON", "BC", "AB", "MB", "QC", "NS", "SK"];

    // Build the random therapist object
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const gender = getRandomElement(genders);
    const province = getRandomElement(provinces);

    // Generate a random 5-digit number for license
    const licenseNumber = Math.floor(10000 + Math.random() * 90000).toString();

    return {
      // Core info
      first_name: firstName,
      last_name: lastName,
      pronouns:
        gender === "non_binary"
          ? getRandomElement(["they/them", "ze/hir", "ze/zir", "xe/xem"])
          : gender === "female"
          ? getRandomElement(["she/her", "she/they"])
          : getRandomElement(["he/him", "he/they"]),
      gender: gender,

      // Identity
      ethnicity: getRandomElements(
        [
          "asian",
          "black",
          "hispanic",
          "indigenous",
          "middle_eastern",
          "pacific_islander",
          "white",
          "multiracial",
          "prefer_not_to_say",
        ],
        Math.floor(Math.random() * 2) + 1
      ),
      sexuality: getRandomElements(
        [
          "straight",
          "gay",
          "lesbian",
          "bisexual",
          "queer",
          "pansexual",
          "asexual",
          "questioning",
          "prefer_not_to_say",
        ],
        1
      ),
      faith: getRandomElements(
        [
          "agnostic",
          "atheist",
          "buddhist",
          "christian",
          "hindu",
          "jewish",
          "muslim",
          "sikh",
          "spiritual",
          "other",
          "prefer_not_to_say",
        ],
        Math.floor(Math.random() * 2) + 1
      ),

      // Profile
      profile_img_url: `https://randomuser.me/api/portraits/${
        gender === "female"
          ? "women"
          : gender === "male"
          ? "men"
          : Math.random() > 0.5
          ? "women"
          : "men"
      }/${Math.floor(Math.random() * 70) + 1}.jpg`,
      video_intro_link:
        Math.random() > 0.7
          ? `https://www.youtube.com/watch?v=example${Math.floor(
              Math.random() * 1000
            )}`
          : null,
      ai_summary: `${firstName} is a compassionate ${
        gender === "female"
          ? "woman"
          : gender === "male"
          ? "man"
          : "non-binary person"
      } who specializes in ${getRandomElement(
        areasFocusOptions
      )} and ${getRandomElement(areasFocusOptions)}.`,

      // Contact info
      therapist_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@therapist-example.com`,
      therapist_phone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(
        Math.random() * 900 + 100
      )}${Math.floor(Math.random() * 9000 + 1000)}`,

      // Location
      clinic_name: `${lastName} Counselling Services`,
      clinic_street: `${
        Math.floor(Math.random() * 999) + 100
      } ${getRandomElement([
        "Maple",
        "Oak",
        "Pine",
        "Cedar",
        "Elm",
      ])} ${getRandomElement([
        "Street",
        "Avenue",
        "Boulevard",
        "Road",
        "Drive",
      ])}`,
      clinic_city: getRandomElement(cities),
      clinic_postal_code: `${getRandomElement([
        "A",
        "B",
        "C",
        "E",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "R",
        "S",
        "T",
        "V",
        "X",
        "Y",
      ])}${Math.floor(Math.random() * 10)}${getRandomElement([
        "A",
        "B",
        "C",
        "E",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "R",
        "S",
        "T",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ])} ${Math.floor(Math.random() * 10)}${getRandomElement([
        "A",
        "B",
        "C",
        "E",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "R",
        "S",
        "T",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ])}${Math.floor(Math.random() * 10)}`,
      clinic_province: province,
      clinic_country: "CA",
      clinic_phone: `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(
        Math.random() * 900 + 100
      )}${Math.floor(Math.random() * 9000 + 1000)}`,

      // Availability
      availability: getRandomElement(["online", "in_person", "both"]),

      // Professional details
      education: getRandomElements(
        educationOptions,
        Math.floor(Math.random() * 3) + 1
      ),
      certifications: getRandomElements(
        certificationOptions,
        Math.floor(Math.random() * 3) + 1
      ),
      approaches: {
        long_term: getRandomElements(
          approachOptions,
          Math.floor(Math.random() * 5) + 1
        ),
        short_term: getRandomElements(
          approachOptions,
          Math.floor(Math.random() * 3) + 1
        ),
      },
      areas_of_focus: getRandomElements(
        areasFocusOptions,
        Math.floor(Math.random() * 8) + 3
      ),
      languages: getRandomElements(
        languageOptions,
        Math.floor(Math.random() * 2) + 1
      ),

      // Bio
      bio: `${firstName} ${lastName} is a ${getRandomElement([
        "compassionate",
        "dedicated",
        "experienced",
        "empathetic",
        "skilled",
      ])} therapist with a passion for helping clients overcome ${getRandomElement(
        [
          "life challenges",
          "mental health issues",
          "relationship problems",
          "past trauma",
          "personal growth obstacles",
        ]
      )}. With ${Math.floor(Math.random() * 15) + 2} years of experience, ${
        gender === "female" ? "she" : gender === "male" ? "he" : "they"
      } create${
        gender === "non_binary" ? "" : "s"
      } a safe and supportive environment for clients to explore their feelings and develop effective coping strategies.`,

      // Verification
      is_verified: false,

      // License details for the related table
      license: {
        license_number: licenseNumber,
        state: province,
        title: getRandomElement(licenseTypes),
        issuing_body: `${province} Association of ${getRandomElement([
          "Clinical Counsellors",
          "Social Workers",
          "Psychotherapists",
          "Psychologists",
        ])}`,
        expiry_date: new Date(
          new Date().setFullYear(
            new Date().getFullYear() + Math.floor(Math.random() * 3) + 1
          )
        )
          .toISOString()
          .split("T")[0],
        is_verified: Math.random() > 0.3,
      },

      // Fees - array of fee objects
      fees: [
        {
          session_category: "initial",
          session_type: "individual",
          delivery_method: "in_person",
          duration_minutes: 50,
          price: Math.floor(Math.random() * 50 + 120),
          currency: "CAD",
        },
        {
          session_category: "subsequent",
          session_type: "individual",
          delivery_method: "in_person",
          duration_minutes: 50,
          price: Math.floor(Math.random() * 40 + 100),
          currency: "CAD",
        },
        {
          session_category: "initial",
          session_type: "couples",
          delivery_method: "in_person",
          duration_minutes: 80,
          price: Math.floor(Math.random() * 60 + 160),
          currency: "CAD",
        },
        {
          session_category: "subsequent",
          session_type: "couples",
          delivery_method: "in_person",
          duration_minutes: 80,
          price: Math.floor(Math.random() * 50 + 140),
          currency: "CAD",
        },
      ],
    };
  };

  const insertManyRandomTherapists = async () => {
    setBulkLoading(true);
    setResult("");
    let successCount = 0;

    try {
      setResult("Starting bulk upload...\n");

      // Generate random therapists
      const randomTherapists = Array.from({ length: bulkCount }, () =>
        generateRandomTherapist()
      );

      // Insert each therapist and related records
      for (let i = 0; i < randomTherapists.length; i++) {
        const therapistData = randomTherapists[i];
        setResult(
          (prev) =>
            prev +
            `\nProcessing therapist ${i + 1}/${randomTherapists.length}: ${
              therapistData.first_name
            } ${therapistData.last_name}...`
        );

        // Extract license and fees for related tables
        const { license, fees, ...therapistOnly } = therapistData;

        // Insert therapist
        const { data: therapist, error: therapistError } = await supabase
          .from("therapists")
          .insert([therapistOnly])
          .select("id")
          .single();

        if (therapistError) {
          console.error("Error inserting therapist:", therapistError);
          setResult(
            (prev) =>
              prev +
              `\nError inserting therapist ${therapistData.first_name}: ${therapistError.message}`
          );
          continue;
        }

        // Insert license
        const { error: licenseError } = await supabase
          .from("therapist_licenses")
          .insert([
            {
              therapist_id: therapist.id,
              ...license,
            },
          ]);

        if (licenseError) {
          console.error("Error inserting license:", licenseError);
          setResult(
            (prev) =>
              prev +
              `\nError inserting license for ${therapistData.first_name}: ${licenseError.message}`
          );
          // Continue with fees even if license insert fails
        }

        // Insert fees
        const feesWithTherapistId = fees.map((fee) => ({
          ...fee,
          therapist_id: therapist.id,
        }));

        const { error: feesError } = await supabase
          .from("therapist_fees")
          .insert(feesWithTherapistId);

        if (feesError) {
          console.error("Error inserting fees:", feesError);
          setResult(
            (prev) =>
              prev +
              `\nError inserting fees for ${therapistData.first_name}: ${feesError.message}`
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
          `${successCount} of ${randomTherapists.length} therapists inserted successfully.\n` +
          prev
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      setResult((prev) => prev + `\nUnexpected error: ${err}`);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Therapist Upload</h1>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Supabase Connection Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Supabase URL:</p>
            <code className="block p-2 mt-1 text-xs bg-gray-100 rounded overflow-auto">
              {supabaseUrl}
            </code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Anon Key (first 12 chars):
            </p>
            <code className="block p-2 mt-1 text-xs bg-gray-100 rounded">
              {supabaseAnonKey.substring(0, 12)}...
            </code>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-700">
              Connection Status:
            </p>
            <div className="flex items-center mt-1">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">
                Connected to Supabase instance
              </span>
            </div>
          </div>
        </div>
      </div>

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

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-md font-semibold mb-2">Database Tables Used</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>
            <code>therapists</code> - Main therapist profile information
          </li>
          <li>
            <code>therapist_licenses</code> - Professional license information
          </li>
          <li>
            <code>therapist_fees</code> - Session pricing information
          </li>
        </ul>
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-bold mb-4">View Therapists in Database</h2>

        <button
          onClick={queryAllTherapists}
          disabled={therapistQueryLoading}
          className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${
            therapistQueryLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {therapistQueryLoading ? "Loading..." : "Query All Therapists"}
        </button>

        {therapistQueryError && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            <p className="font-medium">Error:</p>
            <p>{therapistQueryError}</p>
          </div>
        )}

        {therapistQueryResult && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              Found {therapistQueryResult.length} therapists in database:
            </p>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              {therapistQueryResult.map((therapist) => (
                <div
                  key={therapist.id}
                  className="p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {therapist.profile_img_url && (
                      <img
                        src={therapist.profile_img_url}
                        alt={`${therapist.first_name} ${therapist.last_name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">
                        {therapist.first_name} {therapist.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {therapist.pronouns} • {therapist.clinic_city},{" "}
                        {therapist.clinic_province}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Languages:</span>{" "}
                      {therapist.languages.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">Availability:</span>{" "}
                      {therapist.availability === "both"
                        ? "In-person & Online"
                        : therapist.availability === "online"
                        ? "Online Only"
                        : "In-person Only"}
                    </div>
                    <div>
                      <span className="font-medium">Areas of Focus:</span>{" "}
                      {therapist.areas_of_focus.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium">Approaches:</span>{" "}
                      {therapist.approaches?.long_term?.join(", ")}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {therapist.therapist_licenses &&
                      therapist.therapist_licenses.map(
                        (license: any, idx: number) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {license.title} #{license.license_number}
                          </span>
                        )
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-lg font-semibold mb-2">
          Bulk Upload Random Therapists
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Generate and upload random therapist profiles with related data.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Number of therapists:
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={bulkCount}
            onChange={(e) => setBulkCount(parseInt(e.target.value) || 10)}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <button
          onClick={insertManyRandomTherapists}
          disabled={bulkLoading}
          className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 ${
            bulkLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {bulkLoading
            ? "Uploading..."
            : `Upload ${bulkCount} Random Therapists`}
        </button>
      </div>

      <a
        href="supa-chat-context"
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        Back to Chat: supa-chat-context
      </a>
    </div>
  );
}
