import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import type { TherapistProfile } from '../../utils/pineconeHelpers';
import {
  fetchPineconeProfile,
  mapPineconeToTherapistProfile,
  nameFromSlug,
  generateProfileSlug,
} from '../../utils/pineconeHelpers';
import { Suspense } from 'react';
import Loading from './loading';
import { getSafeImageUrl } from '@/app/utils/imageHelpers';
import { useState } from 'react';
import CollapsibleSpecialties from '@/app/components/CollapsibleSpecialties';
import CollapsibleApproaches from '@/app/components/CollapsibleApproaches';
import { Checkmark, XMark, Warning } from '@/components/Icons';
import TelehealthStatus from '@/components/TelehealthStatus';

async function getTherapist(slug: string): Promise<TherapistProfile | null> {
  //  NEVER TOUCH THIS
  try {
    // Decode any URL-encoded or Unicode characters in the slug
    const decodedSlug = decodeURIComponent(slug);

    // Convert slug back to name format with decoded characters
    const nameFromSlugFormat = nameFromSlug(decodedSlug);

    // Try exact match first
    const exactMatchProfile = await fetchPineconeProfile(nameFromSlugFormat);
    if (exactMatchProfile) {
      // console.log(
      //   `[getTherapist] ✅ Found profile by exact name match: ${exactMatchProfile.name}`
      // );
      return mapPineconeToTherapistProfile(exactMatchProfile);
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

// Generate static paths - this will be replaced with actual data fetching
export async function generateStaticParams() {
  //  NEVER TOUCH THIS
  console.log('[generateStaticParams] Generating static params');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error('[generateStaticParams] NEXT_PUBLIC_API_URL not set');
    return [];
  }

  try {
    const allNames: string[] = [];
    let pageToken: string | undefined;
    const PAGE_SIZE = 60;

    // Fetch all pages
    do {
      const url = new URL(`${apiUrl}/profile/names-sitemap`);
      url.searchParams.set('pageSize', PAGE_SIZE.toString());
      if (pageToken) {
        url.searchParams.set('pageToken', pageToken);
      }

      console.log(`[generateStaticParams] Fetching names from: ${url.toString()}`);
      const res = await fetch(url.toString());

      if (!res.ok) {
        console.error(`[generateStaticParams] API error: ${res.status} ${res.statusText}`);
        return [];
      }

      const data = await res.json();
      const names = data?.data?.therapistNames || [];
      const debug = data?.debug;

      allNames.push(...names);
      pageToken = debug?.nextPageToken;

      console.log(
        `[generateStaticParams] Fetched ${names.length} names (total: ${allNames.length})`
      );
    } while (pageToken);

    // Filter out any null/undefined/invalid names
    const validNames = allNames.filter(
      (name: any): name is string => typeof name === 'string' && name.trim().length > 0
    );

    if (validNames.length === 0) {
      console.error('[THERAPIST_PAGE] No valid names found in response:', {
        totalNames: allNames.length,
        sampleNames: allNames.slice(0, 5),
      });
      return [];
    }

    console.log(
      `[THERAPIST_PAGE] Found ${
        validNames.length
      } valid therapist names out of ${allNames.length} total.
Sample names: ${validNames.slice(0, 3).join(', ')}...`
    );

    // Generate slugs for each therapist
    const params = validNames.map((name) => {
      const slug = generateProfileSlug(name.trim());
      if (slug === 'unknown-therapist') {
        console.warn(`[THERAPIST_PAGE] Generated fallback slug for name: "${name}"`);
      }
      return { slug };
    });

    return params;
  } catch (error) {
    console.error('[THERAPIST_PAGE] Error generating static params:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return [];
  }
}

// Generate JSON-LD structured data
function generateJsonLd(therapist: TherapistProfile) {
  //  NEVER TOUCH THIS
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: therapist.name,
    description: therapist.bio,
    jobTitle: therapist.title,
    knowsLanguage: therapist.languages,
    address: {
      '@type': 'PostalAddress',
      addressLocality: therapist.location.city,
      addressRegion: therapist.location.province,
      addressCountry: therapist.location.country,
    },
    hasCredential: therapist.education.map((edu) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: edu.degree,
      educationalLevel: 'PostBaccalaureate',
      recognizedBy: {
        '@type': 'Organization',
        name: edu.institution,
      },
      dateCreated: edu.year.toString(),
    })),
    workExperience: therapist.experience.map((exp) => ({
      '@type': 'OccupationalExperience',
      title: exp.position,
      employedIn: {
        '@type': 'Organization',
        name: exp.organization,
      },
      startDate: exp.startYear.toString(),
      endDate: exp.endYear?.toString() || 'Present',
    })),
    priceRange: `$${therapist.rates.initial}-${therapist.rates.ongoing}`,
    image: therapist.imageUrl ? `https://matchya.ai${therapist.imageUrl}` : undefined,
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
      title: 'Therapist Not Found | Matchya',
      description: 'The requested therapist profile could not be found.',
    };
  }

  const title = `${therapist.name} - ${therapist.title || 'Therapist'} | Matchya`;
  const description = `${therapist.name} is a ${therapist.title} in ${
    therapist.location.city
  }, specializing in ${therapist.specialties.join(', ')}. Book your session today.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
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
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: therapist.imageUrl ? [therapist.imageUrl] : undefined,
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Main server component
const TherapistContent = ({ therapist }: { therapist: TherapistProfile }) => (
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
                  src={getSafeImageUrl(therapist.imageUrl)}
                  alt={`${therapist.name}'s profile photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-3 col-span-6">
            <h1 className="font-tuppence font-light text-3xl lg:text-4xl font-bold md:mb-2 md:pb-12">
              {therapist.name || 'Name Not Available'}
            </h1>
          </div>
          <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start sm:flex-col-reverse sm:flex-col lg:flex-row">
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
              <h2 className="font-medium mb-2">About {therapist.name || 'Name Not Available'}</h2>
              <p className="text-gray-700 text-base">{therapist.bio || 'No bio available'}</p>
            </div>
          </div>
          <div className="md:col-span-1 sm:col-span-2">
            <div className="flex flex-col gap-8">
              <div className="border-grey-extraDark border rounded-lg sm:p-8 p-6 flex flex-col sm:gap-8 gap-4">
                <div className="flex flex-col gap-3">
                  <h2 className="font-medium mb-2 text-2xl">Location</h2>
                  <div className="mb-8">
                    <h3 className="text-sm mb-2">In-Person Appointments</h3>
                    {therapist.clinic || 'Not Specified'}
                    <div className="space-y-1"></div>
                  </div>
                  <div className="">
                    <h3 className="text-sm mb-2">Telehealth</h3>
                    <div className="mb-4">
                      <TelehealthStatus isAvailable={therapist.available_online} />
                    </div>
                  </div>
                </div>
                <hr />
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium text-2xl">Billing & Insurance</h2>
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
                        <h3 className="text-lg mb-4">For Individual Counselling</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Initial Visit</span>
                            {therapist.rates?.initial && therapist.rates.initial > 0 ? (
                              <span className="text-xl">${therapist.rates.initial}</span>
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
                            {therapist.rates?.subsequent_60 && therapist.rates.subsequent_60 > 0 ? (
                              <span className="text-xl">${therapist.rates.subsequent_60}</span>
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
                            {therapist.rates?.subsequent_90 && therapist.rates.subsequent_90 > 0 ? (
                              <span className="text-xl">${therapist.rates.subsequent_90}</span>
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
                        <h3 className="text-lg mb-4">For Couple's Counselling</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Initial Visit</span>
                            {therapist.rates?.couples_initial &&
                            therapist.rates.couples_initial > 0 ? (
                              <span className="text-xl">${therapist.rates.couples_initial}</span>
                            ) : (
                              <span className="text-sm text-grey-extraDark">
                                Info not available
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Subsequent Visit</span>
                            {therapist.rates?.couples_subsequent &&
                            therapist.rates.couples_subsequent > 0 ? (
                              <span className="text-xl">${therapist.rates.couples_subsequent}</span>
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
                          <span className="text-sm text-grey-extraDark">Info Not Available</span>
                        </div>
                      </div>

                      {/* Billing */}
                      <div>
                        <h3 className="text-lg mb-2">Billing</h3>
                        <div className="flex items-center">
                          {/* <div className="w-4 h-4 rounded-full bg-matchya-yellow " /> */}
                          <span className="text-sm text-grey-extraDark">Info Not Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-grey-extraDark border rounded-lg p-8 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <h2 className="font-medium mb-2 text-2xl">Qualifications</h2>
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
                    <h2 className="font-medium mb-2 text-2xl">Areas of Practice</h2>
                    <CollapsibleSpecialties specialties={therapist.specialties || []} />
                  </div>
                  <hr />
                  <div className="flex flex-col gap-3">
                    <h2 className="font-medium mb-2 text-2xl">Therapeutic Approaches</h2>
                    <CollapsibleApproaches approaches={therapist.approaches || []} />
                  </div>
                </div>
                <hr />
                <div className="flex flex-col gap-3">
                  <h2 className="font-medium mb-2 text-2xl">License</h2>
                  <p className="text-gray-700"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default async function TherapistProfile({ params }: { params: { slug: string } }) {
  const therapist = await getTherapist(params.slug);

  if (!therapist) {
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
