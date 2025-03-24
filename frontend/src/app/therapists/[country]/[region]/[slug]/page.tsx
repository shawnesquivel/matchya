import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { TherapistProfile } from "@/app/utils/supabaseHelpers";
import { getTherapistProfile } from "@/app/utils/supabaseHelpers";
import Loading from "./loading";
import { getSafeImageUrl } from "@/app/utils/imageHelpers";
import CollapsibleAreasOfFocus from "@/app/components/CollapsibleAreasOfFocus";
import CollapsibleApproaches from "@/app/components/CollapsibleApproaches";
import { mockTherapistProfile, shouldUseMockDataForSlug } from "@/app/utils/mockTherapistData";
import TherapistLocation from "@/app/components/TherapistLocation";
import TherapistFees from "@/app/components/TherapistFees";
import TherapistLicenses from "@/app/components/TherapistLicenses";
import TherapistQualifications from "@/app/components/TherapistQualifications";
import { TherapistVideos } from "@/app/components/TherapistVideos";
import { isValidRegion, getCountryName, getRegionName } from "@/app/utils/locationData";
import DirectoryBreadcrumbs from "@/app/components/DirectoryBreadcrumbs";

// Dynamically import client components
const TherapistProfileTracker = dynamic(() => import("@/app/components/TherapistProfileTracker"), {
  ssr: false,
});

const TherapistProfileHeader = dynamic(() => import("@/app/components/TherapistProfileHeader"), {
  ssr: false,
  loading: () => <div className="h-[60px] bg-white shadow-sm"></div>,
});

// Define a client component placeholder for where the links should appear
const LinkPlaceholder = dynamic(() => import("@/app/components/OutboundLinkTracker"), {
  ssr: false,
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

    // Check if this is our test user
    if (shouldUseMockDataForSlug(decodedSlug)) {
      console.log(`[getTherapist] Using mock data for slug: ${slug}`);
      console.log(
        "[getTherapist] Mock data structure:",
        JSON.stringify(mockTherapistProfile).substring(0, 100) + "..."
      );
      return {
        ...mockTherapistProfile,
        slug: "emma-thompson-test123", // Add slug to mock data
      };
    }

    // Use the slug directly for fetching the therapist profile
    const therapistProfile = await getTherapistProfile(decodedSlug);

    if (therapistProfile) {
      return therapistProfile;
    } else {
      console.log(
        `[getTherapist] ❌ No profile found for slug: ${slug}, decodedSlug: ${decodedSlug}`
      );
      return null;
    }
  } catch (error) {
    console.error(`[THERAPIST_PAGE] ❌ Error in getTherapist: ${error}`);
    return null;
  }
}

// Generate JSON-LD structured data
function generateJsonLd(therapist: TherapistProfile, country: string, region: string) {
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
    jobTitle: therapist.licenses[0]?.title || "Therapist",
    url: `https://matchya.app/therapists/${country.toLowerCase()}/${region.toLowerCase()}/${
      therapist.slug ||
      encodeURIComponent(
        `${therapist.first_name.toLowerCase()}-${therapist.last_name.toLowerCase()}`
      )
    }`,
    address: {
      "@type": "PostalAddress",
      addressLocality: therapist?.clinic_city,
      addressRegion: therapist?.clinic_province,
      addressCountry: therapist?.clinic_country,
    },
    hasCredential: therapist.education.map((edu) => ({
      "@type": "EducationalOccupationalCredential",
      name: edu,
    })),
    workExperience: therapist.licenses.map((exp) => ({
      "@type": "OccupationalExperience",
      title: exp.title,
      employedIn: {
        "@type": "Organization",
        name: exp.issuing_body,
      },
      startDate: exp.expiry_date,
      endDate: exp.expiry_date,
    })),
    priceRange: `$${initialPrice}-${subsequentPrice}`,
    image: therapist.profile_img_url
      ? `https://matchya.app${therapist.profile_img_url}`
      : undefined,
  };
}

// Main server component
const TherapistContent = ({
  therapist,
  country,
  region,
}: {
  therapist: TherapistProfile;
  country: string;
  region: string;
}) => {
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();
  const countryName = getCountryName(countryCode);
  const regionName = getRegionName(countryCode, regionCode);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Therapists", href: "/therapists/browse" },
    { name: countryName, href: `/therapists/browse/${countryCode}` },
    { name: regionName, href: `/therapists/browse/${countryCode}/${regionCode}` },
    { name: `${therapist.first_name} ${therapist.last_name}`, href: `#` },
  ];

  return (
    <>
      <TherapistProfileHeader therapist={therapist} />
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
          __html: JSON.stringify(generateJsonLd(therapist, country, region)),
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: buttonHoverStyles }} />

      <div>
        {/* Banner and Header styled like the modal */}
        <div className="bg-beige sm:py-14 py-12 relative"></div>
        <div className="bg-white pt-8 sm:px-3 sm:pt-4 px-3">
          {/* Add breadcrumbs */}
          <div className="container mx-auto mb-6">
            <DirectoryBreadcrumbs breadcrumbs={breadcrumbs} />
          </div>
          <div className="grid grid-cols-6 sm:gap-8 gap-3 container mx-auto">
            <div className="relative md:col-span-1 sm:col-span-2 col-span-6">
              <div className="relative w-[40vw] md:w-full md:left-0 md:translate-x-0">
                <div className="absolute max-w-[100px] sm:max-w-[120px] md:max-w-[160px] w-full md:bottom-0 bottom-0 border border-grey-extraDark aspect-square rounded-full overflow-hidden md:translate-y-[60%] translate-y-[30%]">
                  {therapist.profile_img_url ? (
                    <>
                      <Image
                        src={getSafeImageUrl(therapist.profile_img_url)}
                        alt={`${therapist.first_name} ${therapist.last_name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        priority
                      />
                    </>
                  ) : (
                    <div className="bg-grey-light h-full w-full flex items-center justify-center"></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-3 col-span-6 mt-8 sm:mt-4 md:mt-0">
              <h1 className="font-new-spirit text-3xl lg:text-4xl font-light">
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
        <div className="bg-white sm:px-8 px-3">
          <div className="container mx-auto gap-8 grid md:grid-cols-3 sm:grid-cols-1 md:py-14 sm:py-8">
            <div className="md:col-span-2 sm:col-span-2 gap-10">
              <div className="flex flex-col gap-2">
                {/* Introduction videos above bio */}
                {therapist.videos &&
                  therapist.videos.filter((v) => v.type === "intro").length > 0 && (
                    <div className="mb-6">
                      <h2 className="font-new-spirit font-light text-2xl mb-2">
                        Meet {therapist.first_name}
                      </h2>
                      <TherapistVideos videos={therapist.videos} variant="page" type="intro" />
                    </div>
                  )}

                <h2 className="font-new-spirit font-light text-2xl mb-2">
                  About {therapist.first_name}
                </h2>
                <p className="text-mblack">{therapist.bio || "No bio available"}</p>

                {/* FAQ videos after bio in accordion style */}
                {therapist.videos &&
                  therapist.videos.filter((v) => v.type === "faq").length > 0 && (
                    <div className="mt-8">
                      <h2 className="font-new-spirit font-light text-2xl mb-6">FAQs</h2>
                      <TherapistVideos videos={therapist.videos} variant="page" type="faq" />
                    </div>
                  )}

                {/* Testimonial videos below FAQ in carousel style */}
                {therapist.videos &&
                  therapist.videos.filter((v) => v.type === "testimonial").length > 0 && (
                    <div className="mt-8">
                      <h2 className="font-new-spirit font-light text-2xl mb-6">Testimonials</h2>
                      <TherapistVideos
                        videos={therapist.videos}
                        variant="page"
                        type="testimonial"
                      />
                    </div>
                  )}

                <div className="mt-8 flex flex-col gap-2">
                  <h2 className="font-light font-new-spirit text-2xl">Areas of Practice</h2>
                  <CollapsibleAreasOfFocus areasOfFocus={therapist.areas_of_focus || []} />
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <h2 className="font-light font-new-spirit text-2xl">Therapeutic Approaches</h2>
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
    </>
  );
};

export default async function TherapistProfile({
  params,
}: {
  params: { country: string; region: string; slug: string };
}) {
  const { country, region, slug } = params;
  const countryCode = country.toLowerCase();
  const regionCode = region.toLowerCase();

  // Validate region
  if (!isValidRegion(countryCode, regionCode)) {
    notFound();
  }

  const therapist = await getTherapist(slug);

  if (!therapist) {
    notFound();
  }

  return (
    <main className="">
      <Suspense fallback={<Loading />}>
        <TherapistContent therapist={therapist} country={country} region={region} />
      </Suspense>
    </main>
  );
}
