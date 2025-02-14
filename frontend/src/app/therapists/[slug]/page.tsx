import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { TherapistProfile } from "../../utils/pineconeHelpers";
import {
  fetchPineconeProfile,
  mapPineconeToTherapistProfile,
  nameFromSlug,
  generateProfileSlug,
} from "../../utils/pineconeHelpers";
import { Suspense } from "react";
import Loading from "./loading";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";

async function getTherapist(slug: string): Promise<TherapistProfile | null> {
  try {
    console.log("Original slug:", { slug });

    // Decode any URL-encoded or Unicode characters in the slug
    const decodedSlug = decodeURIComponent(slug);
    console.log("Decoded slug:", { decodedSlug });

    // Convert slug back to name format with decoded characters
    const nameFromSlugFormat = nameFromSlug(decodedSlug);
    console.log("Name from slug:", { nameFromSlugFormat });

    // Try exact match first
    const exactMatchProfile = await fetchPineconeProfile(nameFromSlugFormat);
    if (exactMatchProfile) {
      console.log("Found profile by exact name match:", {
        profileName: exactMatchProfile.name,
        matchedName: nameFromSlugFormat,
      });
      return mapPineconeToTherapistProfile(exactMatchProfile);
    }

    // If no exact match, try with the original slug converted to spaces
    const spaceFormattedName = decodedSlug.replace(/-/g, " ");
    console.log("Trying space-formatted name:", { spaceFormattedName });

    const spaceMatchProfile = await fetchPineconeProfile(spaceFormattedName);
    if (spaceMatchProfile) {
      console.log("Found profile by space-formatted name:", {
        profileName: spaceMatchProfile.name,
        matchedName: spaceFormattedName,
      });
      return mapPineconeToTherapistProfile(spaceMatchProfile);
    }

    // If still no match, try with the original decoded slug
    const slugMatchProfile = await fetchPineconeProfile(decodedSlug);
    if (slugMatchProfile) {
      console.log("Found profile by original slug:", {
        profileName: slugMatchProfile.name,
        matchedSlug: decodedSlug,
      });
      return mapPineconeToTherapistProfile(slugMatchProfile);
    }

    console.log("No profile found:", {
      slug,
      decodedSlug,
      nameFromSlugFormat,
      spaceFormattedName,
      attempts: ["nameFromSlug", "space-formatted", "original-slug"],
    });
    return null;
  } catch (error) {
    console.error("Error in getTherapist:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      slug,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

// Generate static paths - this will be replaced with actual data fetching
export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL not set");

  // Fetch all therapist names
  const res = await fetch(`${apiUrl}/profile/names`);
  const {
    data: { names },
  } = await res.json();

  // Generate slugs for each therapist
  return names.map((name: string) => ({
    slug: generateProfileSlug(name),
  }));
}

// Generate JSON-LD structured data
function generateJsonLd(therapist: TherapistProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: therapist.name,
    description: therapist.bio,
    jobTitle: therapist.title,
    knowsLanguage: therapist.languages,
    address: {
      "@type": "PostalAddress",
      addressLocality: therapist.location.city,
      addressRegion: therapist.location.province,
      addressCountry: therapist.location.country,
    },
    hasCredential: therapist.education.map((edu) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: edu.degree,
      educationalLevel: "PostBaccalaureate",
      recognizedBy: {
        "@type": "Organization",
        name: edu.institution,
      },
      dateCreated: edu.year.toString(),
    })),
    workExperience: therapist.experience.map((exp) => ({
      "@type": "OccupationalExperience",
      title: exp.position,
      employedIn: {
        "@type": "Organization",
        name: exp.organization,
      },
      startDate: exp.startYear.toString(),
      endDate: exp.endYear?.toString() || "Present",
    })),
    priceRange: `$${therapist.rates.initial}-${therapist.rates.ongoing}`,
    image: therapist.imageUrl
      ? `https://matchya.ai${therapist.imageUrl}`
      : undefined,
  };
}

// Update metadata generation to include more meta tags
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const therapist = await getTherapist(params.slug);

  if (!therapist) {
    return {
      title: "Therapist Not Found | Matchya",
      description: "The requested therapist profile could not be found.",
    };
  }

  const title = `${therapist.name} - ${
    therapist.title || "Therapist"
  } | Matchya`;
  const description = `${therapist.name} is a ${therapist.title} in ${
    therapist.location.city
  }, specializing in ${therapist.specialties.join(
    ", "
  )}. Book your session today.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: therapist.imageUrl
        ? [
            {
              url: therapist.imageUrl,
              width: 800,
              height: 800,
              alt: therapist.name,
            },
          ]
        : undefined,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: therapist.imageUrl ? [therapist.imageUrl] : undefined,
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

const TherapistContent = ({ therapist }: { therapist: TherapistProfile }) => (
  <>
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateJsonLd(therapist)),
      }}
    />
    {/* Debug JSON */}
    <div className="mb-8 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
      <h2 className="text-sm font-mono mb-2 text-gray-500">
        Raw Profile Data:
      </h2>
      <pre className="text-xs font-mono whitespace-pre-wrap">
        {JSON.stringify(therapist, null, 2)}
      </pre>
    </div>

    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Image */}
        <div className="w-full md:w-1/3">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={getSafeImageUrl(therapist.imageUrl)}
              alt={`${therapist.name}'s profile photo`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="w-full md:w-2/3">
          {/* Core Details */}
          <h1 className="text-3xl font-bold mb-2">
            {therapist.name || "Name Not Available"}
          </h1>
          <div className="space-y-2 mb-6">
            <p className="text-gray-600">
              <span className="font-medium">Clinic:</span>{" "}
              {therapist.clinic || "Not Specified"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Location:</span>{" "}
              {therapist.location?.city || "City"},{" "}
              {therapist.location?.province || "Province"},{" "}
              {therapist.country || "Country"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Gender:</span>{" "}
              {therapist.gender || "Not Specified"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Bio Link:</span>{" "}
              {therapist.bio_link || "Not Available"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Profile Link:</span>{" "}
              {therapist.profile_link || "Not Available"}
            </p>
          </div>

          {/* Availability Badge */}
          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                therapist.available_online
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {therapist.available_online
                ? "Available Online"
                : "In-Person Only"}
            </span>
          </div>

          {/* Summaries */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Short Summary</h3>
              <p className="text-gray-700">
                {therapist.short_summary || "No short summary available"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Full Summary</h3>
              <p className="text-gray-700">
                {therapist.summary || "No summary available"}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Bio</h3>
              <p className="text-gray-700">
                {therapist.bio || "No bio available"}
              </p>
            </div>
          </div>

          {/* Fees & Booking */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Fees</h3>
              {therapist.fees && therapist.fees.length > 0 ? (
                <ul className="list-disc list-inside">
                  {therapist.fees.map((fee, index) => (
                    <li key={index} className="text-gray-700">
                      {fee || "Fee structure not specified"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">No fee information available</p>
              )}
            </div>
            {therapist.booking_link && (
              <a
                href={therapist.booking_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Book a Session
              </a>
            )}
          </div>

          {/* Languages */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.languages?.length > 0 ? (
                therapist.languages.map((language) => (
                  <span
                    key={language}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {language}
                  </span>
                ))
              ) : (
                <span className="text-gray-700">No languages specified.</span>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Qualifications</h3>
            {therapist.qualifications?.length > 0 ? (
              <ul className="list-disc list-inside">
                {therapist.qualifications.map((qual, index) => (
                  <li key={index} className="text-gray-700">
                    {qual}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No qualifications listed</p>
            )}
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.specialties?.length > 0 ? (
                therapist.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="text-gray-700">No specialties listed</span>
              )}
            </div>
          </div>

          {/* Approaches */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Therapeutic Approaches</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.approaches?.length > 0 ? (
                therapist.approaches.map((approach) => (
                  <span
                    key={approach}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                  >
                    {approach}
                  </span>
                ))
              ) : (
                <span className="text-gray-700">No approaches listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Education & Experience */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Education */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div className="space-y-4">
            {therapist.education.map((edu, index) => (
              <div key={index}>
                <h3 className="font-medium">{edu.degree}</h3>
                <p className="text-gray-600">
                  {edu.institution} • {edu.year}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Experience</h2>
          <div className="space-y-4">
            {therapist.experience.map((exp, index) => (
              <div key={index}>
                <h3 className="font-medium">{exp.position}</h3>
                <p className="text-gray-600">
                  {exp.organization} • {exp.startYear}-
                  {exp.endYear || "Present"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Practice Details */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Session Types & Insurance */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Practice Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Session Types</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.sessionTypes.map((type) => (
                  <span
                    key={type}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Insurance Accepted</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.insuranceAccepted.map((insurance) => (
                  <span
                    key={insurance}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {insurance}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rates */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Rates</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Initial Session:</span> $
              {therapist.rates.initial}
            </p>
            <p>
              <span className="font-medium">Ongoing Sessions:</span> $
              {therapist.rates.ongoing}
            </p>
          </div>
        </section>
      </div>
    </div>
  </>
);

export default async function TherapistProfile({
  params,
}: {
  params: { slug: string };
}) {
  const therapist = await getTherapist(params.slug);

  if (!therapist) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loading />}>
        <TherapistContent therapist={therapist} />
      </Suspense>
    </main>
  );
}
