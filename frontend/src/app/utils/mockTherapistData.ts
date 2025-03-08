// Mock therapist data for use when the database is unavailable
import { Therapist } from '../contexts/TherapistContext';
import { TherapistProfile } from './supabaseHelpers';

// Mock data for TherapistResultsPanel
export const mockTherapist: Therapist = {
  id: 'mock-therapist-001',
  first_name: 'Emma',
  last_name: 'Thompson',
  pronouns: 'she/her',
  gender: 'female',
  ethnicity: ['caucasian', 'asian'],
  sexuality: ['straight'],
  faith: ['buddhist'],
  bio: 'I am a licensed psychologist with over 10 years of experience helping individuals overcome anxiety, depression, and trauma. My approach is collaborative, warm, and evidence-based.',
  ai_summary: 'Dr. Emma Thompson specializes in anxiety disorders, depression, and trauma recovery, utilizing evidence-based approaches including CBT and mindfulness practices. She creates a warm, judgment-free space for clients from diverse backgrounds.',
  areas_of_focus: ['anxiety', 'depression', 'trauma', 'relationship issues', 'life transitions'],
  approaches: ['psychodynamic', 'attachment-based', 'cognitive behavioral therapy', 'mindfulness-based stress reduction'],
  profile_img_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  video_intro_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  clinic_profile_url: 'https://www.psychologytoday.com',
  clinic_booking_url: 'https://calendly.com',
  therapist_email: 'emma.thompson@therapy.com',
  therapist_phone: '(555) 123-4567',
  clinic_name: 'Wellness Therapy Center',
  clinic_street: '123 Healing Street',
  clinic_city: 'San Francisco',
  clinic_province: 'CA',
  clinic_postal_code: '94110',
  clinic_country: 'USA',
  clinic_phone: '(555) 987-6543',
  availability: 'both',
  languages: ['English', 'Spanish'],
  education: ['Ph.D. Clinical Psychology, Stanford University', 'M.A. Counseling Psychology, UC Berkeley'],
  certifications: ['Licensed Psychologist', 'Certified EMDR Practitioner'],
  licenses: [
    {
      id: 'license-001',
      license_number: 'PSY12345',
      state: 'California',
      title: 'Licensed Psychologist',
      issuing_body: 'California Board of Psychology',
      expiry_date: '2025-12-31',
      is_verified: true
    },
    {
      id: 'license-002',
      license_number: 'MFT78910',
      state: 'California',
      title: 'Certified Marriage and Family Therapist',
      issuing_body: 'California Board of Behavioral Sciences',
      expiry_date: '2024-06-30',
      is_verified: false
    }
  ],
  is_verified: true
};

// Mock data for TherapistProfileModal
export const mockTherapistProfile: TherapistProfile = {
  id: 'mock-therapist-001',
  first_name: 'Emma',
  last_name: 'Thompson',
  title: 'Licensed Psychologist',
  bio: 'I am a licensed psychologist with over 10 years of experience helping individuals overcome anxiety, depression, and trauma. My approach is collaborative, warm, and evidence-based. I believe in creating a safe space where clients can explore their thoughts and feelings without judgment.',
  specialties: ['Anxiety', 'Depression', 'Trauma', 'Relationship Issues', 'Life Transitions'],
  education: ['Ph.D. Clinical Psychology, Stanford University', 'M.A. Counseling Psychology, UC Berkeley'],
  experience: [
    {
      position: 'Clinical Psychologist',
      organization: 'Wellness Therapy Center',
      startYear: 2015,
      endYear: undefined // Present
    },
    {
      position: 'Staff Psychologist',
      organization: 'Bay Area Community Health',
      startYear: 2012,
      endYear: 2015
    }
  ],
  languages: ['English', 'Spanish'],
  profile_img_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  location: {
    city: 'San Francisco',
    province: 'CA',
    country: 'USA'
  },
  available_online: true,
  booking_link: 'https://calendly.com',
  approaches: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'Psychodynamic', 'EMDR', 'Attachment-Based'],
  short_summary: 'Specializing in anxiety, depression, and trauma using evidence-based approaches.',
  qualifications: ['Licensed Psychologist', 'EMDR Certified', 'Mindfulness Instructor'],
  clinic: 'Wellness Therapy Center',
  gender: 'Female',
  clinic_profile_url: 'https://www.psychologytoday.com',
  bio_link: 'https://www.therapistwebsite.com',
  profile_link: 'https://www.linkedin.com',
  licenses: [
    {
      id: 'license-001',
      title: 'Licensed Psychologist',
      license_number: 'PSY12345',
      state: 'California',
      issuing_body: 'California Board of Psychology',
      is_verified: true,
      expiry_date: '2025-12-31',
      last_verified_date: '2023-01-15'
    },
    {
      id: 'license-002',
      title: 'Certified Marriage and Family Therapist',
      license_number: 'MFT78910',
      state: 'California',
      issuing_body: 'California Board of Behavioral Sciences',
      is_verified: false,
      expiry_date: '2024-06-30',
      last_verified_date: null
    }
  ],
  fees: [
    {
      session_type: 'individual',
      session_category: 'initial',
      delivery_method: 'in_person',
      duration_minutes: 50,
      price: 175,
      currency: 'USD'
    },
    {
      session_type: 'individual',
      session_category: 'subsequent',
      delivery_method: 'in_person',
      duration_minutes: 50,
      price: 150,
      currency: 'USD'
    },
    {
      session_type: 'couples',
      session_category: 'initial',
      delivery_method: 'in_person',
      duration_minutes: 80,
      price: 200,
      currency: 'USD'
    },
    {
      session_type: 'couples',
      session_category: 'subsequent',
      delivery_method: 'in_person',
      duration_minutes: 80,
      price: 190,
      currency: 'USD'
    }
  ],
  pronouns: 'she/her',
  sexuality: ['Straight'],
  ethnicity: ['Caucasian', 'Asian'],
  faith: ['Buddhist'],
  therapist_email: 'emma.thompson@therapy.com',
  therapist_phone: '(555) 123-4567',
  clinic_phone: '(555) 987-6543',
  clinic_street: '123 Healing Street',
  clinic_postal_code: '94110',
  video_intro_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  is_verified: true,
  ai_summary: 'Dr. Emma Thompson specializes in anxiety disorders, depression, and trauma recovery, utilizing evidence-based approaches including CBT and mindfulness practices. She creates a warm, judgment-free space for clients from diverse backgrounds.'
};

// Helper functions for mock data
export const getNameFromMockSlug = (slug: string): string => {
  if (slug === 'test-user' || slug === 'emma-thompson') {
    return 'Dr. Emma Thompson';
  }
  return slug;
};

// Helper function to check if we should use mock data for a slug
export const shouldUseMockDataForSlug = (slug: string): boolean => {
  return slug === 'test-user' || slug === 'emma-thompson';
}; 