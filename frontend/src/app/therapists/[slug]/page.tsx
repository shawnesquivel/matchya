import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { TherapistProfile } from "../../utils/supabaseHelpers";
import {
  getTherapistProfile,
  nameFromSlug,
  generateProfileSlug,
  fetchTherapistNames,
} from "../../utils/supabaseHelpers";
import { Suspense } from "react";
import Loading from "./loading";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import CollapsibleSpecialties from "@/app/components/CollapsibleSpecialties";
import CollapsibleApproaches from "@/app/components/CollapsibleApproaches";
// import { Checkmark, XMark, Warning } from "@/components/Icons";
import TelehealthStatus from "@/components/TelehealthStatus";
import {
  mockTherapistProfile,
  shouldUseMockDataForSlug,
} from "../../utils/mockTherapistData";

async function getTherapist(slug: string): Promise<TherapistProfile | null> {
  try {
    // Decode any URL-encoded or Unicode characters in the slug
    const decodedSlug = decodeURIComponent(slug);

    // Check if this is our test user
    if (shouldUseMockDataForSlug(decodedSlug)) {
      console.log(`[getTherapist] Using mock data for slug: ${slug}`);
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

    console.log(
      `[generateStaticParams] Fetched ${allNames.length} therapist names`
    );

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
      (fee) =>
        fee.session_type === "individual" && fee.session_category === "initial"
    );
    return initialFee?.price || 0;
  };

  const getSubsequentFee = (): number => {
    const subsequentFee = therapist.fees?.find(
      (fee) =>
        fee.session_type === "individual" &&
        fee.session_category === "subsequent"
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

  const title = `${therapist.first_name} - ${
    therapist.title || "Therapist"
  } | Matchya`;
  const description = `${therapist.first_name} is a ${therapist.title} in ${
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
      images: therapist.profile_img_url
        ? [therapist.profile_img_url]
        : undefined,
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Main server component
const TherapistContent = ({ therapist }: { therapist: TherapistProfile }) => {
  // Add helper functions to get fee information
  const getIndividualFee = (
    category: string,
    minutes: number = 50
  ): number | null => {
    const fee = therapist.fees?.find(
      (f) =>
        f.session_type === "individual" &&
        f.session_category === category &&
        f.duration_minutes === minutes
    );
    return fee?.price || null;
  };

  const getCouplesFee = (
    category: string,
    minutes: number = 80
  ): number | null => {
    const fee = therapist.fees?.find(
      (f) =>
        f.session_type === "couples" &&
        f.session_category === category &&
        f.duration_minutes === minutes
    );
    return fee?.price || null;
  };

  // Fee values
  const initialIndividualFee = getIndividualFee("initial");
  const subsequent60Fee = getIndividualFee("subsequent", 60);
  const subsequent90Fee = getIndividualFee("subsequent", 90);
  const couplesInitialFee = getCouplesFee("initial");
  const couplesSubsequentFee = getCouplesFee("subsequent");

  return (
    <>
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
      {/* Debug JSON */}
      {/* <div className="mb-8 p-4 bg-white rounded-lg overflow-auto max-h-96">
        <h2 className="text-sm font-mono mb-2 text-gray-500">Raw Profile Data:</h2>
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {JSON.stringify(therapist, null, 2)}
        </pre>
      </div> */}
      <div className="">
        <div className="bg-beige sm:py-14 py-20"></div>
        <div className="bg-white pt-12 px-4">
          <div className="grid grid-cols-6 gap-8 container mx-auto">
            <div className="relative md:col-span-1 sm:col-span-2 col-span-6">
              <div className="relative w-[40vw] md:w-full md:left-0 md:translate-x-0">
                <div className="absolute max-w-[150px] md:max-w-none w-full bottom-0 border border-grey-extraDark aspect-square rounded-full overflow-hidden md:translate-y-[50%]">
                  <Image
                    src={getSafeImageUrl(therapist.profile_img_url)}
                    alt={`${therapist.first_name}'s profile photo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-3 col-span-6">
              <h1 className="font-tuppence text-3xl lg:text-4xl font-bold md:mb-2 md:pb-12">
                {therapist.first_name || "Name Not Available"}
              </h1>
            </div>
            <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start sm:flex-col-reverse lg:flex-row">
              {therapist.bio_link && (
                <a
                  href={therapist.bio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full flex justify-center align-middle px-4 h-fit py-4 text-mblack"
                >
                  View website
                </a>
              )}
              {therapist.booking_link && (
                <a
                  href={therapist.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full flex justify-center align-middle px-4 h-fit py-4 bg-green text-white-dark"
                >
                  Book an Appointment
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white px-4">
          <div className="container mx-auto gap-8 grid md:grid-cols-3 sm:grid-cols-1 md:py-14 sm:py-8">
            <div className="md:col-span-2 sm:col-span-2 gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-medium mb-2">
                  About {therapist.first_name || "Name Not Available"}
                </h2>
                <p className="text-gray-700 text-base">
                  {therapist.bio || "No bio available"}
                </p>
              </div>
            </div>
            <div className="md:col-span-1 sm:col-span-2">
              <div className="flex flex-col gap-8">
                <div className="border-grey-extraDark border rounded-lg sm:p-8 p-6 flex flex-col sm:gap-8 gap-4">
                  <div className="flex flex-col gap-3">
                    <h2 className="font-medium mb-2 text-2xl">Location</h2>
                    <div className="mb-8">
                      <h3 className="text-sm mb-2">In-Person Appointments</h3>
                      {therapist.clinic || "Not Specified"}
                      <div className="space-y-1"></div>
                    </div>
                    <div className="">
                      <h3 className="text-sm mb-2">Telehealth</h3>
                      <div className="mb-4">
                        <TelehealthStatus
                          isAvailable={therapist.available_online}
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-medium text-2xl">
                        Billing & Insurance
                      </h2>
                      <a
                        href={therapist.booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-matchya-green underline text-sm"
                      >
                        Full Pricing
                      </a>
                    </div>
                    {/* <div>
                    {therapist.fees && therapist.fees.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {therapist.fees.map((fee, index) => (
                          <li key={index} className="text-gray-700">
                            {fee || 'Fee structure not specified'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700">No fee information available</p>
                    )}
                  </div> */}
                    <div className="">
                      <div className="">
                        {/* Individual Counselling */}
                        <div className="mb-8">
                          <h3 className="text-lg mb-4">
                            For Individual Counselling
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Initial Visit</span>
                              {initialIndividualFee &&
                              initialIndividualFee > 0 ? (
                                <span className="text-xl">
                                  ${initialIndividualFee}
                                </span>
                              ) : (
                                <span className="text-sm text-grey-extraDark">
                                  Info not available
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span>Subsequent Visit </span>
                                <span className="text-gray-500">(60 min)</span>
                              </div>
                              {subsequent60Fee && subsequent60Fee > 0 ? (
                                <span className="text-xl">
                                  ${subsequent60Fee}
                                </span>
                              ) : (
                                <span className="text-sm text-grey-extraDark">
                                  Info not available
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <span>Subsequent Visit </span>
                                <span className="text-gray-500">(90 min)</span>
                              </div>
                              {subsequent90Fee && subsequent90Fee > 0 ? (
                                <span className="text-xl">
                                  ${subsequent90Fee}
                                </span>
                              ) : (
                                <span className="text-sm text-grey-extraDark">
                                  Info not available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Couple's Counselling */}
                        <div className="mb-8">
                          <h3 className="text-lg mb-4">
                            For Couple's Counselling
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Initial Visit</span>
                              {couplesInitialFee && couplesInitialFee > 0 ? (
                                <span className="text-xl">
                                  ${couplesInitialFee}
                                </span>
                              ) : (
                                <span className="text-sm text-grey-extraDark">
                                  Info not available
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Subsequent Visit</span>
                              {couplesSubsequentFee &&
                              couplesSubsequentFee > 0 ? (
                                <span className="text-xl">
                                  ${couplesSubsequentFee}
                                </span>
                              ) : (
                                <span className="text-sm text-grey-extraDark">
                                  Info not available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sliding Scale */}
                        <div className="mb-8">
                          <h3 className="text-lg mb-2">Sliding Scale</h3>
                          <div className="flex items-center">
                            {/* <div className="w-4 h-4 rounded-full bg-matchya-yellow" /> */}
                            <span className="text-sm text-grey-extraDark">
                              Info Not Available
                            </span>
                          </div>
                        </div>

                        {/* Billing */}
                        <div>
                          <h3 className="text-lg mb-2">Billing</h3>
                          <div className="flex items-center">
                            {/* <div className="w-4 h-4 rounded-full bg-matchya-yellow " /> */}
                            <span className="text-sm text-grey-extraDark">
                              Info Not Available
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-grey-extraDark border rounded-lg p-8 flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <h2 className="font-medium mb-2 text-2xl">
                      Qualifications
                    </h2>
                    <div className="space-y-4">
                      {therapist.education.map((edu, index) => (
                        <div key={index}>
                          <h3 className="font-medium">{edu.degree}</h3>
                          <p className="text-gray-600">
                            {edu.institution}, {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr />
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3">
                      <h2 className="font-medium mb-2 text-2xl">
                        Areas of Practice
                      </h2>
                      <CollapsibleSpecialties
                        specialties={therapist.specialties || []}
                      />
                    </div>
                    <hr />
                    <div className="flex flex-col gap-3">
                      <h2 className="font-medium mb-2 text-2xl">
                        Therapeutic Approaches
                      </h2>
                      <CollapsibleApproaches
                        approaches={therapist.approaches || []}
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="flex flex-col gap-3">
                    <h2 className="font-medium mb-2 text-2xl">License</h2>
                    {therapist.licenses && therapist.licenses.length > 0 ? (
                      <div className="space-y-4">
                        {therapist.licenses.map((license, index) => (
                          <div key={index} className="space-y-1">
                            <h3 className="font-medium">{license.title}</h3>
                            <p className="text-gray-600">
                              License Number: {license.license_number}
                            </p>
                            <p className="text-gray-600">
                              State/Province: {license.state}
                            </p>
                            {license.issuing_body && (
                              <p className="text-gray-600">
                                Issuing Body: {license.issuing_body}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : therapist.experience.some(
                        (exp) =>
                          exp.position.toLowerCase().includes("license") ||
                          exp.organization.toLowerCase().includes("license")
                      ) ? (
                      <div className="space-y-4">
                        {therapist.experience
                          .filter(
                            (exp) =>
                              exp.position.toLowerCase().includes("license") ||
                              exp.organization.toLowerCase().includes("license")
                          )
                          .map((license, index) => (
                            <div key={index} className="space-y-1">
                              <h3 className="font-medium">
                                {license.position}
                              </h3>
                              <p className="text-gray-600">
                                {license.organization}
                              </p>
                              <p className="text-gray-500 text-sm">
                                {license.startYear}
                                {license.endYear
                                  ? ` - ${license.endYear}`
                                  : " - Present"}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : therapist.qualifications &&
                      therapist.qualifications.length > 0 ? (
                      <div className="space-y-1">
                        <ul className="list-disc list-inside">
                          {therapist.qualifications.map((qual, index) => (
                            <li key={index} className="text-gray-700 mb-1">
                              {qual}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-sm text-grey-extraDark">
                          License information not available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* TODO: Replace with this code to use the reusable component */}
                  {/* 
                  <TherapistLicenses 
                    therapist={therapist} 
                    variant="page" 
                  /> 
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

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
    <main className="">
      <Suspense fallback={<Loading />}>
        <TherapistContent therapist={therapist} />
      </Suspense>

      {/* Testing Section for Designer Reference */}
      <div className="container mx-auto mt-16 mb-16 px-4">
        <div className="border-2 border-dashed border-red-400 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-red-500">
            Testing - Additional Available Data
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This section displays all available data from the database that
            isn't currently shown in the UI. For designer reference only.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity Information */}
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

            {/* Contact Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Therapist Email:</span>{" "}
                  {therapist.therapist_email || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Therapist Phone:</span>{" "}
                  {therapist.therapist_phone || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Clinic Phone:</span>{" "}
                  {therapist.clinic_phone || "Not specified"}
                </div>
              </div>
            </div>

            {/* Full Address */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Complete Address</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Street:</span>{" "}
                  {therapist.clinic_street || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">City:</span>{" "}
                  {therapist.location?.city || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Province/State:</span>{" "}
                  {therapist.location?.province || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Postal/Zip Code:</span>{" "}
                  {therapist.clinic_postal_code || "Not specified"}
                </div>
                <div>
                  <span className="font-medium">Country:</span>{" "}
                  {therapist.location?.country || "Not specified"}
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Media</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Video Intro:</span>{" "}
                  {therapist.video_intro_link ? (
                    <a
                      href={therapist.video_intro_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Video
                    </a>
                  ) : (
                    "Not available"
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Verification Status</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Profile Verified:</span>{" "}
                  {therapist.is_verified ? "✓ Verified" : "✗ Not Verified"}
                </div>

                {therapist.licenses && therapist.licenses.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium">License Verification:</h4>
                    {therapist.licenses.map((license, index) => (
                      <div
                        key={index}
                        className="ml-4 mt-2 p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium">{license.title}:</span>{" "}
                          {license.is_verified
                            ? "✓ Verified"
                            : "✗ Not Verified"}
                        </div>
                        {license.expiry_date && (
                          <div>
                            <span className="font-medium">Expires:</span>{" "}
                            {license.expiry_date}
                          </div>
                        )}
                        {license.last_verified_date && (
                          <div>
                            <span className="font-medium">Last Verified:</span>{" "}
                            {license.last_verified_date}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">AI-Generated Summary</h3>
              <div>{therapist.ai_summary || "No AI summary available"}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
