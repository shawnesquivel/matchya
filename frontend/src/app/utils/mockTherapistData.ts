// Mock therapist data for use when the database is unavailable
import { Therapist } from "../contexts/TherapistContext";
import { TherapistProfile } from "./supabaseHelpers";
import { TherapistVideo } from "../components/VideoEmbed";

// Mock data for TherapistResultsPanel
export const mockTherapist: Therapist = {
  id: "mock-therapist-001",
  first_name: "Emma",
  last_name: "Thompson",
  pronouns: "she/her",
  gender: "female",
  ethnicity: ["caucasian", "asian"],
  sexuality: ["straight"],
  faith: ["buddhist"],
  bio:
    "I am a licensed psychologist with over 10 years of experience helping individuals overcome anxiety, depression, and trauma. My approach is collaborative, warm, and evidence-based.",
  ai_summary:
    "Dr. Emma Thompson specializes in anxiety disorders, depression, and trauma recovery, utilizing evidence-based approaches including CBT and mindfulness practices. She creates a warm, judgment-free space for clients from diverse backgrounds.",
  areas_of_focus: [
    "anxiety",
    "depression",
    "trauma",
    "relationship issues",
    "life transitions",
  ],
  approaches: [
    "psychodynamic",
    "attachment-based",
    "cognitive behavioral therapy",
    "mindfulness-based stress reduction",
  ],
  profile_img_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  video_intro_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  clinic_profile_url: "https://www.psychologytoday.com",
  clinic_booking_url: "https://calendly.com",
  therapist_email: "emma.thompson@therapy.com",
  therapist_phone: "(555) 123-4567",
  clinic_name: "Wellness Therapy Center",
  clinic_street: "123 Healing Street",
  clinic_city: "San Francisco",
  clinic_province: "CA",
  clinic_postal_code: "94110",
  clinic_country: "USA",
  clinic_phone: "(555) 987-6543",
  availability: "both",
  languages: ["English", "Spanish"],
  education: [
    "Ph.D. Clinical Psychology, Stanford University",
    "M.A. Counseling Psychology, UC Berkeley",
  ],
  certifications: ["Licensed Psychologist", "Certified EMDR Practitioner"],
  licenses: [
    {
      id: "license-001",
      license_number: "PSY12345",
      state: "California",
      title: "Licensed Psychologist",
      issuing_body: "California Board of Psychology",
      expiry_date: "2025-12-31",
      is_verified: true,
    },
    {
      id: "license-002",
      license_number: "MFT78910",
      state: "California",
      title: "Certified Marriage and Family Therapist",
      issuing_body: "California Board of Behavioral Sciences",
      expiry_date: "2024-06-30",
      is_verified: false,
    },
  ],
  is_verified: true,
  slug: "emma-thompson-mock01",
};

// Add mock prompts for testing
export const mockPrompts = [
  {
    id: "mock-prompt-1",
    prompt_id: "prompt-personal-1",
    question: "What led you to become a therapist?",
    answer:
      "I became a therapist because I've always been fascinated by human behavior and wanted to help others navigate life's challenges. After experiencing my own journey through therapy, I was inspired to provide that same support to others.",
    category_name: "personal",
    category_display_name: "Personal",
  },
  {
    id: "mock-prompt-2",
    prompt_id: "prompt-therapeutic-1",
    question: "How would you describe your therapeutic approach?",
    answer:
      "I use an integrative approach that combines cognitive-behavioral therapy (CBT), mindfulness practices, and person-centered techniques. I believe therapy should be tailored to each individual's unique needs and goals, rather than following a rigid framework.",
    category_name: "therapeutic",
    category_display_name: "Therapeutic Approach",
  },
  {
    id: "mock-prompt-3",
    prompt_id: "prompt-fun-1",
    question: "What's your favorite self-care activity?",
    answer:
      "On weekends, you'll find me hiking in nature or practicing yoga. I've found that connecting with the outdoors helps me reset and maintain my own mental health. I also enjoy cooking and trying new recipes as a form of creative expression.",
    category_name: "fun",
    category_display_name: "Fun Facts",
  },
  {
    id: "mock-prompt-4",
    prompt_id: "prompt-personal-2",
    question: "If therapy had a theme song, mine would be",
    answer:
      "I'd choose 'Lean on Me' by Bill Withers. It perfectly captures the essence of therapy - being there for each other, offering support, and knowing it's okay to ask for help when you need it.",
    category_name: "personal",
    category_display_name: "Personal",
  },
  {
    id: "mock-prompt-5",
    prompt_id: "prompt-therapeutic-2",
    question: "In my therapy room, you can always expect",
    answer:
      "A warm, welcoming space with comfortable seating, soft lighting, and a collection of fidget toys. I believe creating a safe, calming environment is essential for open and honest communication.",
    category_name: "therapeutic",
    category_display_name: "Therapeutic Approach",
  },
  {
    id: "mock-prompt-6",
    prompt_id: "prompt-fun-2",
    question: "The emoji that best represents my therapy style",
    answer:
      "🌱 - Like a growing plant, I believe in nurturing growth at your own pace, providing the right environment for healing and development.",
    category_name: "fun",
    category_display_name: "Fun Facts",
  },
  {
    id: "mock-prompt-7",
    prompt_id: "prompt-personal-3",
    question: "My go-to self-care ritual is",
    answer:
      "Morning meditation followed by journaling. It helps me stay grounded and present, which is essential for both my personal well-being and my ability to support others.",
    category_name: "personal",
    category_display_name: "Personal",
  },
  {
    id: "mock-prompt-8",
    prompt_id: "prompt-therapeutic-3",
    question: "A common misconception about therapy that I wish more people knew",
    answer:
      "That therapy is only for people with 'serious' problems. In reality, therapy is for everyone - it's about personal growth, self-discovery, and building resilience, not just addressing crises.",
    category_name: "therapeutic",
    category_display_name: "Therapeutic Approach",
  },
  {
    id: "mock-prompt-9",
    prompt_id: "prompt-fun-3",
    question: "If my therapy style were a coffee order, it would be",
    answer:
      "A warm chai latte with oat milk - comforting, slightly sweet, and always there to help you start your day on a positive note.",
    category_name: "fun",
    category_display_name: "Fun Facts",
  },
  {
    id: "mock-prompt-10",
    prompt_id: "prompt-personal-4",
    question: "A book that changed my perspective on mental health",
    answer:
      "'The Body Keeps the Score' by Bessel van der Kolk. It opened my eyes to the profound connection between mind and body, and how trauma affects us on every level.",
    category_name: "personal",
    category_display_name: "Personal",
  },
  {
    id: "mock-prompt-11",
    prompt_id: "prompt-therapeutic-4",
    question: "I believe healing looks like",
    answer:
      "A journey of self-discovery where you learn to embrace all parts of yourself - the light and the shadow. It's about finding your voice, setting boundaries, and creating a life that feels authentic to you.",
    category_name: "therapeutic",
    category_display_name: "Therapeutic Approach",
  },
  {
    id: "mock-prompt-12",
    prompt_id: "prompt-fun-4",
    question: "If I could add one 'unconventional' tool to my therapy practice, it would be",
    answer:
      "A therapy dog! I believe in the healing power of animal companionship and would love to have a gentle, trained therapy dog to help create an even more welcoming environment.",
    category_name: "fun",
    category_display_name: "Fun Facts",
  }
];

// Mock data for TherapistProfileModal
export const mockTherapistProfile: TherapistProfile = {
  id: "mock-therapist-123",
  first_name: "Emma",
  middle_name: null,
  last_name: "Thompson",
  pronouns: "she/her",
  ethnicity: ["white"],
  gender: "female",
  sexuality: ["straight"],
  faith: ["spiritual"],
  initial_price: "150",
  subsequent_price: "120",
  availability: "both",
  languages: ["English", "French"],
  areas_of_focus: [
    "Anxiety",
    "Depression",
    "Trauma",
    "PTSD",
    "Grief",
    "Relationships",
    "Self-esteem",
  ],
  approaches: [
    "Cognitive Behavioral Therapy (CBT)",
    "Mindfulness",
    "Acceptance and Commitment Therapy (ACT)",
    "Psychodynamic",
    "EMDR",
  ],
  similarity: 0.89,
  is_accepting_clients: true,
  bio:
    "As a licensed psychologist with over 15 years of experience, I specialize in helping adults navigate anxiety, depression, and trauma. My approach is collaborative, empathetic, and evidence-based. I believe therapy is a journey we take together, and I'm committed to creating a safe, non-judgmental space where you can explore your challenges and strengths. Outside of my practice, I enjoy hiking, reading, and spending time with my family and golden retriever, Charlie.",
  profile_img_url: "https://randomuser.me/api/portraits/women/25.jpg",
  video_intro_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  clinic_profile_url: "https://example-clinic.com/dr-emma-thompson",
  clinic_booking_url: "https://example-clinic.com/book/dr-emma-thompson",
  booking_link: "https://example-clinic.com/book/dr-emma-thompson",
  therapist_email: "emma.thompson@example-clinic.com",
  therapist_phone: "+15551234567",
  clinic_name: "Wellness Therapy Center",
  clinic_street: "123 Healing Way",
  clinic_city: "Vancouver",
  clinic_province: "BC",
  clinic_postal_code: "V6B 1S5",
  clinic_country: "CA",
  clinic_phone: "+16049876543",
  education: [
    "Ph.D. Clinical Psychology, University of British Columbia",
    "M.A. Counseling Psychology, Simon Fraser University",
    "B.A. Psychology, University of Victoria",
  ],
  certifications: [
    "Registered Psychologist #1234",
    "Certified EMDR Practitioner",
    "Certified Trauma Specialist",
  ],
  licenses: [
    {
      id: "license-1",
      license_number: "RPT1234",
      state: "BC",
      title: "RCC",
      issuing_body: "BCACC",
      expiry_date: "2025-12-31",
      is_verified: true,
    },
    {
      id: "license-2",
      license_number: "PSY5678",
      state: "ON",
      title: "CPsych",
      issuing_body: "College of Psychologists of Ontario",
      expiry_date: "2024-06-30",
      is_verified: true,
    },
  ],
  fees: [
    {
      session_type: "individual",
      session_category: "initial",
      delivery_method: "in_person",
      duration_minutes: 60,
      price: 150,
      currency: "CAD",
    },
    {
      session_type: "individual",
      session_category: "subsequent",
      delivery_method: "in_person",
      duration_minutes: 50,
      price: 120,
      currency: "CAD",
    },
    {
      session_type: "individual",
      session_category: "initial",
      delivery_method: "virtual",
      duration_minutes: 60,
      price: 140,
      currency: "CAD",
    },
    {
      session_type: "individual",
      session_category: "subsequent",
      delivery_method: "virtual",
      duration_minutes: 50,
      price: 110,
      currency: "CAD",
    },
  ],
  ai_summary:
    "Dr. Emma Thompson specializes in anxiety disorders, depression, and trauma recovery, utilizing evidence-based approaches including CBT and mindfulness practices. She creates a warm, judgment-free space for clients from diverse backgrounds.",
  videos: [
    {
      id: "1",
      url: "https://www.youtube.com/watch?v=ja9JwGDaVeY",
      platform: "youtube",
      type: "intro",
      title: "Welcome to my practice",
      description: "A short introduction to my therapy approach",
      display_order: 0,
      is_active: true,
    },
    // FAQ Videos for accordion
    {
      id: "2",
      url: "https://www.youtube.com/watch?v=ja9JwGDaVeY",
      platform: "youtube",
      type: "faq",
      title: "What to expect in your first therapy session",
      description: "Answering common questions about beginning therapy",
      display_order: 1,
      is_active: true,
    },
    {
      id: "3",
      url: "https://www.youtube.com/watch?v=ja9JwGDaVeY",
      platform: "youtube",
      type: "faq",
      title: "How long does therapy usually take?",
      description:
        "Information about therapy duration and what factors influence it",
      display_order: 2,
      is_active: true,
    },
    {
      id: "4",
      url: "https://www.youtube.com/watch?v=ja9JwGDaVeY",
      platform: "youtube",
      type: "faq",
      title: "What's the difference between CBT and psychodynamic therapy?",
      description:
        "Explaining different therapy approaches and who they might be right for",
      display_order: 3,
      is_active: true,
    },
    {
      id: "5",
      url: "https://www.youtube.com/watch?v=ja9JwGDaVeY",
      platform: "youtube",
      type: "faq",
      title: "Do you accept insurance?",
      description: "Information about insurance, fees, and billing options",
      display_order: 4,
      is_active: true,
    },
    // Testimonial Videos for carousel
    {
      id: "6",
      url: "https://www.instagram.com/reel/DHURrsOSzyV/?igsh=a2E5Y3dqeXNrZWZ5",
      platform: "instagram",
      type: "testimonial",
      title: "Overcoming anxiety",
      description: "A client shares their journey through anxiety treatment",
      display_order: 1,
      is_active: true,
    },
    {
      id: "7",
      url: "https://www.instagram.com/reel/DHURrsOSzyV/?igsh=a2E5Y3dqeXNrZWZ5",
      platform: "instagram",
      type: "testimonial",
      title: "Finding peace after trauma",
      description: "A testimonial about trauma recovery work",
      display_order: 2,
      is_active: true,
    },
    {
      id: "8",
      url: "https://www.instagram.com/reel/DHURrsOSzyV/?igsh=a2E5Y3dqeXNrZWZ5",
      platform: "instagram",
      type: "testimonial",
      title: "My depression journey",
      description:
        "A client discusses their experience working through depression",
      display_order: 3,
      is_active: true,
    },
    {
      id: "9",
      url: "https://www.instagram.com/reel/DHURrsOSzyV/?igsh=a2E5Y3dqeXNrZWZ5",
      platform: "instagram",
      type: "testimonial",
      title: "Marriage counseling success",
      description: "A couple shares how therapy improved their relationship",
      display_order: 4,
      is_active: true,
    },
    {
      id: "10",
      url: "https://www.instagram.com/reel/DHURrsOSzyV/?igsh=a2E5Y3dqeXNrZWZ5",
      platform: "instagram",
      type: "testimonial",
      title: "Grief and loss support",
      description: "How therapy helped during a difficult loss",
      display_order: 5,
      is_active: true,
    },
  ],
  slug: "emma-thompson-mock123",
  prompts: mockPrompts,
};

// Helper functions for mock data
export const getNameFromMockSlug = (slug: string): string => {
  if (slug === "test-user" || slug === "emma-thompson-mock123") {
    return "Dr. Emma Thompson";
  }
  return slug;
};

// Helper function to check if we should use mock data for a slug
export const shouldUseMockDataForSlug = (slug: string): boolean => {
  const shouldUseMock = slug === "test-user" ||
    slug === "emma-thompson-mock123" ||
    slug === "emma-thompson-test123";
  return shouldUseMock;
};
