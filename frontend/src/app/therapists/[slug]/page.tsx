import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { TherapistProfile } from "../../utils/supabaseHelpers";
import {
  getTherapistProfile,
  nameFromSlug,
  generateProfileSlug,
  fetchTherapistNames,
} from "../../utils/supabaseHelpers";
import Loading from "./loading";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import CollapsibleSpecialties from "@/app/components/CollapsibleSpecialties";
import CollapsibleApproaches from "@/app/components/CollapsibleApproaches";
import TelehealthStatus from "@/components/TelehealthStatus";
import { mockTherapistProfile, shouldUseMockDataForSlug } from "../../utils/mockTherapistData";
import GlobeIcon from "@/components/icons/GlobeIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import TherapistLocation from "@/app/components/TherapistLocation";
import TherapistFees from "@/app/components/TherapistFees";
import TherapistLicenses from "@/app/components/TherapistLicenses";
import TherapistQualifications from "@/app/components/TherapistQualifications";

// Dynamically import the client components with no SSR for proper client-side rendering
const TherapistProfileTracker = dynamic(() => import("../../components/TherapistProfileTracker"), {
  ssr: false,
});

// Define a client component placeholder for where the links should appear
// This ensures we're not trying to pass event handlers to server components
const LinkPlaceholder = dynamic(() => import("../../components/OutboundLinkTracker"), {
  ssr: false,
  // Use a loading placeholder that matches the size of the links area
  loading: () => (
    <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start flex-col">
      <div className="h-12 bg-gray-100 rounded-full animate-pulse"></div>
      <div className="h-12 bg-gray-100 rounded-full animate-pulse"></div>
    </div>
  ),
});

// CSS for fill-from-left hover effect
const buttonHoverStyles = `
  .fill-from-left {
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  
  .fill-from-left::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.02);
    transition: width 0.3s ease;
    z-index: -1;
  }
  
  .fill-from-left:hover::before {
    width: 100%;
  }
`;

async function getTherapist(slug: string): Promise<TherapistProfile | null> {
  try {
    // Decode any URL-encoded or Unicode characters in the slug
    const decodedSlug = decodeURIComponent(slug);

    console.log(`[getTherapist] Processing slug: ${slug}, decoded: ${decodedSlug}`);

    // Check if this is our test user
    if (shouldUseMockDataForSlug(decodedSlug)) {
      console.log(`[getTherapist] Using mock data for slug: ${slug}`);
      console.log(
        "[getTherapist] Mock data structure:",
        JSON.stringify(mockTherapistProfile).substring(0, 100) + "..."
      );
      return mockTherapistProfile;
    }

    // Convert slug back to name format with decoded characters
    const nameFromSlugFormat = nameFromSlug(decodedSlug);

    // Get therapist profile using our new Supabase helper
    const therapistProfile = await getTherapistProfile(nameFromSlugFormat);

    if (therapistProfile) {
      return therapistProfile;
    } else {
      console.log(
        `[getTherapist] ❌ No profile found for slug: ${slug}, decodedSlug: ${decodedSlug}, nameFromSlugFormat: ${nameFromSlugFormat}`
      );
      return null;
    }
  } catch (error) {
    console.error(`[THERAPIST_PAGE] ❌ Error in getTherapist: ${error}`);
    return null;
  }
}

// Generate static paths
export async function generateStaticParams() {
  console.log("[generateStaticParams] Generating static params");

  try {
    const allNames: string[] = [];
    let pageToken: string | undefined;
    const PAGE_SIZE = 60; // Smaller batch size for testing
    let pageCount = 0;

    // Fetch all pages
    do {
      pageCount++;
      console.log(`[generateStaticParams] Fetching page ${pageCount}`);

      const result = await fetchTherapistNames(PAGE_SIZE, pageToken);
      allNames.push(...result.therapistNames);
      pageToken = result.nextPageToken;
    } while (pageToken);

    console.log(`[generateStaticParams] Fetched ${allNames.length} therapist names`);

    return allNames.map((name) => ({
      slug: generateProfileSlug(name),
    }));
  } catch (error) {
    console.error("[generateStaticParams] Error:", error);
    return [];
  }
}

// Generate JSON-LD structured data
function generateJsonLd(therapist: TherapistProfile) {
  const getInitialFee = (): number => {
    const initialFee = therapist.fees?.find(
      (fee) => fee.session_type === "individual" && fee.session_category === "initial"
    );
    return initialFee?.price || 0;
  };

  const getSubsequentFee = (): number => {
    const subsequentFee = therapist.fees?.find(
      (fee) => fee.session_type === "individual" && fee.session_category === "subsequent"
    );
    return subsequentFee?.price || 0;
  };

  const initialPrice = getInitialFee();
  const subsequentPrice = getSubsequentFee();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${therapist.first_name} ${therapist.last_name}`,
    description: therapist.bio,
    jobTitle: therapist.title || "Therapist",
    url: `https://matchya.app/therapists/${encodeURIComponent(
      `${therapist.first_name.toLowerCase()}-${therapist.last_name.toLowerCase()}`
    )}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: therapist.location.city,
      addressRegion: therapist.location.province,
      addressCountry: therapist.location.country,
    },
    hasCredential: therapist.education.map((edu) => ({
      "@type": "EducationalOccupationalCredential",
      name: edu,
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
    priceRange: `$${initialPrice}-${subsequentPrice}`,
    image: therapist.profile_img_url
      ? `https://matchya.app${therapist.profile_img_url}`
      : undefined,
  };
}

// Update metadata generation to include more meta tags
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  //  NEVER TOUCH THIS
  const therapist = await getTherapist(params.slug);

  if (!therapist) {
    return {
      title: "Therapist Not Found | Matchya",
      description: "The requested therapist profile could not be found.",
    };
  }

  const title = `${therapist.first_name} - ${therapist.title || "Therapist"} | Matchya`;
  const description = `${therapist.first_name} is a ${therapist.title} in ${
    therapist.location.city
  }, specializing in ${therapist.specialties.join(", ")}. Book your session today.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: therapist.profile_img_url
        ? [
            {
              url: therapist.profile_img_url,
              width: 800,
              height: 800,
              alt: therapist.first_name,
            },
          ]
        : undefined,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: therapist.profile_img_url ? [therapist.profile_img_url] : undefined,
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Main server component
const TherapistContent = ({ therapist }: { therapist: TherapistProfile }) => {
  return (
    <>
      {/* Client component for tracking views */}
      <TherapistProfileTracker therapist={therapist} />

      <Script
        id="adobe-fonts"
        strategy="beforeInteractive"
        src="https://use.typekit.net/vmx7tbu.css"
      />
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(therapist)),
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: buttonHoverStyles }} />

      <div>
        {/* Banner and Header styled like the modal */}
        <div className="bg-beige sm:py-14 py-20"></div>
        <div className="bg-white pt-8 px-8">
          <div className="grid grid-cols-6 gap-8 container mx-auto">
            <div className="relative md:col-span-1 sm:col-span-2 col-span-6">
              <div className="relative w-[40vw] md:w-full md:left-0 md:translate-x-0">
                <div className="absolute max-w-[150px] md:max-w-none w-full bottom-0 border border-grey-extraDark aspect-square rounded-full overflow-hidden md:translate-y-[50%]">
                  {therapist.profile_img_url ? (
                    <Image
                      src={getSafeImageUrl(therapist.profile_img_url)}
                      alt={`${therapist.first_name} ${therapist.last_name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority
                    />
                  ) : (
                    <div className="bg-grey-light h-full w-full flex items-center justify-center"></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-3 col-span-6">
              <h1 className="text-3xl lg:text-4xl font-medium">
                {therapist.first_name || "Name Not Available"} {therapist.last_name || ""}
              </h1>
              {/* Add pronouns below the therapist's name */}
              {therapist.pronouns && (
                <p className="text-base text-gray-500">{therapist.pronouns}</p>
              )}
            </div>
            <LinkPlaceholder therapist={therapist} />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white px-8">
          <div className="container mx-auto gap-8 grid md:grid-cols-3 sm:grid-cols-1 md:py-14 sm:py-8">
            <div className="md:col-span-2 sm:col-span-2 gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-medium text-xl">About {therapist.first_name}</h2>
                <p className="text-mblack">{therapist.bio || "No bio available"}</p>

                <div className="mt-8 flex flex-col gap-2">
                  <h2 className="font-medium text-xl">Areas of Practice</h2>
                  <CollapsibleSpecialties specialties={therapist.specialties || []} />
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <h2 className="font-medium text-xl">Therapeutic Approaches</h2>
                  <CollapsibleApproaches approaches={therapist.approaches || []} />
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <TherapistLicenses therapist={therapist} variant="page" />
                </div>
              </div>
            </div>

            <div className="md:col-span-1 sm:col-span-2 space-y-8">
              {/* Location Info */}
              <TherapistLocation therapist={therapist} variant="page" />

              {/* Fees Info */}
              <TherapistFees therapist={therapist} variant="page" />

              {/* Qualifications */}
              <TherapistQualifications therapist={therapist} variant="page" />
            </div>
          </div>
        </div>
      </div>

      {/* Testing Section for Designer Reference */}
      {/* <div className="container mx-auto mt-16 mb-16 px-4">
        <div className="border-2 border-dashed border-red-400 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-red-500">
            Testing - Additional Available Data
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This section displays all available data from the database that isn't currently shown in
            the UI. For designer reference only.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Identity Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Pronouns:</span>{" "}
                  {therapist.pronouns || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Sexuality:</span>{" "}
                  {therapist.sexuality && therapist.sexuality.length > 0
                    ? therapist.sexuality.join(", ")
                    : "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Ethnicity:</span>{" "}
                  {therapist.ethnicity && therapist.ethnicity.length > 0
                    ? therapist.ethnicity.join(", ")
                    : "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Faith:</span>{" "}
                  {therapist.faith && therapist.faith.length > 0
                    ? therapist.faith.join(", ")
                    : "Not specified"}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {therapist.therapist_email || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Phone:</span>{" "}
                  {therapist.therapist_phone || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Clinic Phone:</span>{" "}
                  {therapist.clinic_phone || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Clinic Address:</span>{" "}
                  {therapist.clinic_street ? (
                    <span>
                      {therapist.clinic_street}, {therapist.location.city},{" "}
                      {therapist.location.province} {therapist.clinic_postal_code || ""}
                    </span>
                  ) : (
                    "Not specified"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default async function TherapistProfile({ params }: { params: { slug: string } }) {
  console.log(`[TherapistProfile] Route called with slug: ${params.slug}`);
  const therapist = await getTherapist(params.slug);

  console.log(`[TherapistProfile] Therapist data retrieved:`, therapist ? "Yes" : "No");

  if (!therapist) {
    console.log(`[TherapistProfile] No therapist found for slug: ${params.slug}`);
    notFound();
  }

  return (
    <main className="">
      <Suspense fallback={<Loading />}>
        <TherapistContent therapist={therapist} />
      </Suspense>
    </main>
  );
}
