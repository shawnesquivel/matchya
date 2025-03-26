"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Server action to force revalidation of a therapist page
 * This will clear the Next.js cache for the specific therapist page
 */
export async function revalidateTherapistPage(
    country: string,
    region: string,
    slug: string,
) {
    try {
        // Build the path to revalidate
        const therapistPath = `/therapists/${country}/${region}/${slug}`;

        // Also revalidate parent paths
        const regionPath = `/therapists/${country}/${region}`;

        // Force revalidation of these paths
        revalidatePath(therapistPath);
        revalidatePath(regionPath);

        // Also revalidate by tags (in case your data fetching uses tags)
        revalidateTag("therapists");
        revalidateTag(`therapist-${slug}`);

        // Return success with timestamp
        return {
            success: true,
            message: `Revalidated ${therapistPath}`,
            paths: [therapistPath, regionPath],
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Revalidation error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        };
    }
}
