import { Therapist } from "@/app/contexts/TherapistContext";

// Mock therapist profile data generator
const createMockTherapist = (
  id: string,
  firstName: string,
  lastName: string,
  city: string,
  province: string,
): Therapist => {
  // Create the slug in the same format as the database: firstname-lastname-xxxxxx
  const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${
    id.substring(0, 6)
  }`;

  return {
    id,
    first_name: firstName,
    last_name: lastName,
    slug, // Add the slug
    gender: ["female", "male", "non_binary"][parseInt(id) % 3] as
      | "female"
      | "male"
      | "non_binary",
    ethnicity: ["Caucasian", "Asian", "Black", "Hispanic"].slice(
      0,
      1 + (parseInt(id) % 3),
    ),
    sexuality: ["Straight", "LGBTQ+"].slice(0, 1 + (parseInt(id) % 2)),
    faith: ["Christian", "Buddhist", "Muslim", "Jewish", "Hindu", "Atheist"]
      .slice(0, 1 + (parseInt(id) % 3)),
    clinic_city: city,
    clinic_province: province,
    clinic_country: province === "ON" || province === "BC"
      ? "Canada"
      : "United States",
    clinic_name: `${lastName} Therapy Services`,
    clinic_street: `${1000 + parseInt(id)} Main Street`,
    clinic_postal_code: `${province}${id.substring(0, 4)}`,
    languages: ["English", "Spanish", "French"].slice(
      0,
      1 + (parseInt(id) % 3),
    ),
    certifications: [
      `Certified in ${getRandomSpecialties(1)[0]}`,
      `Advanced training in ${getRandomSpecialties(1)[0]}`,
    ],
    profile_img_url: `/assets/images/mock/therapist-${
      (parseInt(id) % 8) + 1
    }.jpg`,
    bio: `${firstName} is a licensed therapist based in ${city}, with over ${
      5 + (parseInt(id) % 10)
    } years of experience helping clients achieve mental wellness and personal growth. Specializing in ${
      getRandomSpecialties(2).join(" and ")
    }, ${firstName} provides compassionate and effective therapy for individuals of all backgrounds.`,
    areas_of_focus: getRandomAreasOfFocus(4 + (parseInt(id) % 4)),
    licenses: [
      {
        id: `lic-${id}`,
        title: getRandomLicenseTitle(),
        license_number: `LT${10000 + parseInt(id)}`,
        issuing_body: "State Board of Psychology",
        state: province,
        expiry_date: new Date(2025, 0, 1).toISOString(),
        is_verified: true,
      },
    ],
    approaches: getRandomApproaches(3 + (parseInt(id) % 3)),
    education: [
      `Ph.D in Psychology, ${getRandomUniversity()}`,
      `Master's in Counseling, ${getRandomUniversity()}`,
    ],
    is_verified: true,
    therapist_phone: `(555) ${100 + parseInt(id)}-${1000 + parseInt(id)}`,
    clinic_phone: `(555) ${200 + parseInt(id)}-${2000 + parseInt(id)}`,
    therapist_email:
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    initial_price: `${120 + (parseInt(id) % 5) * 10}`,
    subsequent_price: `${100 + (parseInt(id) % 5) * 10}`,
    availability: ["both", "online", "in_person"][parseInt(id) % 3] as
      | "both"
      | "online"
      | "in_person",
    clinic_profile_url:
      `https://example.com/therapists/ca/on/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    clinic_booking_url:
      `https://example.com/book/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    pronouns: getRandomPronouns(),
  };
};

// Helper functions to create varied data
const getRandomAreasOfFocus = (count: number): string[] => {
  const areas = [
    "Anxiety",
    "Depression",
    "Trauma",
    "Relationships",
    "Stress Management",
    "Grief & Loss",
    "Life Transitions",
    "Self-Esteem",
    "Career Counseling",
    "Family Conflict",
    "PTSD",
    "Addiction",
    "ADHD",
    "Anger Management",
    "Bipolar Disorder",
    "Chronic Illness",
    "Divorce",
    "Eating Disorders",
    "Identity Development",
    "Parenting",
    "Sleep Issues",
    "Work-Life Balance",
  ];

  return shuffleArray([...areas]).slice(0, count);
};

const getRandomApproaches = (count: number): string[] => {
  const approaches = [
    "Cognitive Behavioral Therapy (CBT)",
    "Psychodynamic",
    "Mindfulness-Based",
    "Solution-Focused",
    "Narrative Therapy",
    "Humanistic",
    "Acceptance & Commitment (ACT)",
    "Dialectical Behavior Therapy (DBT)",
    "Motivational Interviewing",
    "Eye Movement Desensitization and Reprocessing (EMDR)",
    "Family Systems",
    "Person-Centered",
    "Psychoanalytic",
    "Gestalt",
    "Emotion-Focused",
  ];

  return shuffleArray([...approaches]).slice(0, count);
};

const getRandomSpecialties = (count: number): string[] => {
  const specialties = [
    "anxiety disorders",
    "depression",
    "trauma recovery",
    "relationship issues",
    "stress management",
    "grief counseling",
    "addiction recovery",
    "career development",
    "family therapy",
    "couples counseling",
    "mindfulness practices",
    "cognitive behavioral techniques",
  ];

  return shuffleArray([...specialties]).slice(0, count);
};

const getRandomLicenseTitle = (): string => {
  const titles = [
    "Licensed Professional Counselor",
    "Licensed Clinical Social Worker",
    "Licensed Marriage and Family Therapist",
    "Licensed Mental Health Counselor",
    "Clinical Psychologist",
    "Registered Psychotherapist",
  ];

  return titles[Math.floor(Math.random() * titles.length)];
};

const getRandomUniversity = (): string => {
  const universities = [
    "University of Toronto",
    "McGill University",
    "University of British Columbia",
    "University of California",
    "University of Washington",
    "New York University",
    "Stanford University",
    "University of Michigan",
    "Columbia University",
  ];

  return universities[Math.floor(Math.random() * universities.length)];
};

const getRandomPronouns = (): string => {
  const pronouns = ["He/Him", "She/Her", "They/Them"];
  return pronouns[Math.floor(Math.random() * pronouns.length)];
};

// Fisher-Yates shuffle
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Fixed sets of mock data

// Canadian therapists
const canadaTherapists: Therapist[] = [
  // Ontario therapists
  createMockTherapist("461488", "Abby", "Wong", "Toronto", "ON"),
  createMockTherapist("c97bfb", "Ailee", "Gilron", "Toronto", "ON"),
  createMockTherapist("1003", "Emma", "Patel", "Ottawa", "ON"),
  createMockTherapist("1004", "David", "Kim", "Mississauga", "ON"),
  createMockTherapist("1005", "Olivia", "Rodriguez", "Hamilton", "ON"),
  createMockTherapist("1006", "William", "Singh", "London", "ON"),
  createMockTherapist("1007", "Sophia", "Wong", "Brampton", "ON"),
  createMockTherapist("1008", "Daniel", "Gupta", "Kitchener", "ON"),

  // British Columbia therapists
  createMockTherapist("1009", "Ava", "Taylor", "Vancouver", "BC"),
  createMockTherapist("1010", "James", "Lee", "Vancouver", "BC"),
  createMockTherapist("1011", "Charlotte", "Wilson", "Victoria", "BC"),
  createMockTherapist("1012", "Benjamin", "Martinez", "Surrey", "BC"),
  createMockTherapist("1013", "Amelia", "Nguyen", "Burnaby", "BC"),
  createMockTherapist("1014", "Lucas", "Brown", "Kelowna", "BC"),
  createMockTherapist("1015", "Mia", "Sharma", "Abbotsford", "BC"),
  createMockTherapist("1016", "Alexander", "Garcia", "Richmond", "BC"),
];

// US therapists
const usTherapists: Therapist[] = [
  // California therapists
  createMockTherapist("2001", "Evelyn", "Thompson", "Los Angeles", "CA"),
  createMockTherapist("2002", "Henry", "Jackson", "San Francisco", "CA"),
  createMockTherapist("2003", "Grace", "Wang", "San Diego", "CA"),
  createMockTherapist("2004", "Samuel", "Davis", "San Jose", "CA"),
  createMockTherapist("2005", "Lily", "Harris", "Oakland", "CA"),
  createMockTherapist("2006", "Joseph", "Clark", "Sacramento", "CA"),
  createMockTherapist("2007", "Chloe", "Lewis", "Fresno", "CA"),
  createMockTherapist("2008", "Owen", "Walker", "Long Beach", "CA"),

  // New York therapists
  createMockTherapist("2009", "Zoey", "Allen", "New York City", "NY"),
  createMockTherapist("2010", "Gabriel", "Young", "Brooklyn", "NY"),
  createMockTherapist("2011", "Penelope", "King", "Queens", "NY"),
  createMockTherapist("2012", "Carter", "Wright", "Buffalo", "NY"),
  createMockTherapist("2013", "Hannah", "Scott", "Rochester", "NY"),
  createMockTherapist("2014", "Wyatt", "Green", "Syracuse", "NY"),
  createMockTherapist("2015", "Layla", "Baker", "Albany", "NY"),
  createMockTherapist("2016", "Ethan", "Adams", "Yonkers", "NY"),
];

// Mock region data
const mockRegions = {
  ca: [
    { code: "on", name: "Ontario" },
    { code: "bc", name: "British Columbia" },
  ],
  us: [
    { code: "ca", name: "California" },
    { code: "ny", name: "New York" },
  ],
};

// Mock city data
const mockCities = {
  ca: {
    on: [
      "Toronto",
      "Ottawa",
      "Mississauga",
      "Hamilton",
      "London",
      "Brampton",
      "Kitchener",
    ],
    bc: [
      "Vancouver",
      "Victoria",
      "Surrey",
      "Burnaby",
      "Kelowna",
      "Abbotsford",
      "Richmond",
    ],
  },
  us: {
    ca: [
      "Los Angeles",
      "San Francisco",
      "San Diego",
      "San Jose",
      "Oakland",
      "Sacramento",
      "Fresno",
      "Long Beach",
    ],
    ny: [
      "New York City",
      "Brooklyn",
      "Queens",
      "Buffalo",
      "Rochester",
      "Syracuse",
      "Albany",
      "Yonkers",
    ],
  },
};

// Utility functions to get mock data
export const getMockTherapistsByCountry = (
  country: string,
  page: number = 1,
  pageSize: number = 20,
  name?: string,
): { therapists: Therapist[]; totalCount: number } => {
  const therapists = country.toLowerCase() === "ca"
    ? canadaTherapists
    : usTherapists;

  // Filter by name if provided
  let filtered = therapists;
  if (name) {
    const searchTerm = name.toLowerCase();
    filtered = therapists.filter((t) =>
      t.first_name.toLowerCase().includes(searchTerm) ||
      t.last_name.toLowerCase().includes(searchTerm)
    );
  }

  // Calculate pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResults = filtered.slice(start, end);

  return {
    therapists: paginatedResults,
    totalCount: filtered.length,
  };
};

export const getMockTherapistsByRegion = (
  country: string,
  region: string,
  page: number = 1,
  pageSize: number = 20,
  name?: string,
): { therapists: Therapist[]; totalCount: number } => {
  const allTherapists = country.toLowerCase() === "ca"
    ? canadaTherapists
    : usTherapists;

  // Filter by region
  let regionCode = region.toUpperCase();
  if (country.toLowerCase() === "us" && region.toLowerCase() === "ca") {
    regionCode = "CA"; // Handle California special case
  }

  let filtered = allTherapists.filter((t) => t.clinic_province === regionCode);

  // Filter by name if provided
  if (name) {
    const searchTerm = name.toLowerCase();
    filtered = filtered.filter((t) =>
      t.first_name.toLowerCase().includes(searchTerm) ||
      t.last_name.toLowerCase().includes(searchTerm)
    );
  }

  // Calculate pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResults = filtered.slice(start, end);

  return {
    therapists: paginatedResults,
    totalCount: filtered.length,
  };
};

export const getMockTherapistsByCity = (
  country: string,
  region: string,
  city: string,
  page: number = 1,
  pageSize: number = 20,
  name?: string,
): { therapists: Therapist[]; totalCount: number } => {
  const allTherapists = country.toLowerCase() === "ca"
    ? canadaTherapists
    : usTherapists;

  // Format region code
  let regionCode = region.toUpperCase();
  if (country.toLowerCase() === "us" && region.toLowerCase() === "ca") {
    regionCode = "CA"; // Handle California special case
  }

  // Format city name for comparison (handle dash-separated city names)
  const formattedCity = city.replace(/-/g, " ");
  const cityFormatted = formattedCity.split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Filter by region and city
  let filtered = allTherapists.filter((t) =>
    t.clinic_province === regionCode &&
    t.clinic_city.toLowerCase() === cityFormatted.toLowerCase()
  );

  // Filter by name if provided
  if (name) {
    const searchTerm = name.toLowerCase();
    filtered = filtered.filter((t) =>
      t.first_name.toLowerCase().includes(searchTerm) ||
      t.last_name.toLowerCase().includes(searchTerm)
    );
  }

  // Calculate pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResults = filtered.slice(start, end);

  return {
    therapists: paginatedResults,
    totalCount: filtered.length,
  };
};

export const getMockRegionsByCountry = (
  country: string,
): { code: string; name: string }[] => {
  const countryCode = country.toLowerCase();
  return countryCode in mockRegions
    ? mockRegions[countryCode as keyof typeof mockRegions]
    : [];
};

export const getMockCitiesByRegion = (
  country: string,
  region: string,
): string[] => {
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();

  if (countryCode in mockCities) {
    const countryCities = mockCities[countryCode as keyof typeof mockCities];
    if (regionCode in countryCities) {
      return countryCities[regionCode as keyof typeof countryCities];
    }
  }

  return [];
};

export const isMockDataEnabled = (): boolean => {
  // Check if we're in development mode or if a special localStorage flag is set
  return process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      localStorage.getItem("useMockData") === "true");
};
