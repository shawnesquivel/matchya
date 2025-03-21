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
};

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
};

// Helper functions for mock data
export const getNameFromMockSlug = (slug: string): string => {
  if (slug === "test-user" || slug === "emma-thompson") {
    return "Dr. Emma Thompson";
  }
  return slug;
};

// Helper function to check if we should use mock data for a slug
export const shouldUseMockDataForSlug = (slug: string): boolean => {
  const shouldUseMock = slug === "test-user" || slug === "emma-thompson";
  return shouldUseMock;
};
