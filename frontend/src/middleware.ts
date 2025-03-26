import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Export combined middleware for both Clerk auth and therapist redirects
export default clerkMiddleware((auth, request) => {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  console.log(`Middleware executing for path: ${pathname}`);

  // Skip processing for known paths
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    pathname.includes("api/") ||
    pathname.includes("not-found") ||
    pathname.startsWith("/therapists/browse/") // Skip all browse directory pages
  ) {
    console.log(
      `Middleware: Skipping known path: ${pathname.split("/")[1] || pathname}`,
    );
    return NextResponse.next();
  }

  // Case 1: Handle old format URLs - /therapists/[slug]
  if (
    pathname.startsWith("/therapists/") &&
    pathname !== "/therapists" &&
    pathname !== "/therapists/" &&
    pathname.split("/").length === 3
  ) {
    // Skip known paths that have dedicated pages
    const oldSlug = pathname.split("/")[2];
    if (oldSlug === "browse" || oldSlug === "not-found") {
      console.log("Middleware: Skipping known path:", oldSlug);
      return NextResponse.next();
    }

    console.log("Middleware: Detected old URL format:", pathname);
    // Process the old therapist URL
    return handleOldTherapistUrl(request);
  }

  // Case 2: Handle new format URLs with invalid/partial slugs - /therapists/[country]/[region]/[name-without-id]
  if (
    pathname.startsWith("/therapists/") &&
    pathname.split("/").length === 5
  ) {
    const segments = pathname.split("/");
    const slug = segments[4];

    // Check if this is a valid slug format (contains name and ID segment)
    const hasValidSlugFormat = /^[a-z0-9-]+-[a-z0-9]{6}$/.test(slug);

    // If it's not a valid format, handle it as a partial slug
    if (!hasValidSlugFormat) {
      console.log(
        "Middleware: Detected invalid/partial slug format in new URL:",
        slug,
      );

      // If it's a partial name (either hyphenated or single word), handle it
      return handleInvalidSlugFormat(request, slug);
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next();
});

// Helper function to handle invalid slug formats in new URL pattern
async function handleInvalidSlugFormat(
  request: NextRequest,
  invalidSlug: string,
) {
  console.log("Middleware: Handling invalid slug format:", invalidSlug);

  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the current URL to get country and region
    const segments = request.nextUrl.pathname.split("/");
    const country = segments[2];
    const region = segments[3];

    // CASE 1: Try to find by slug pattern (if it has hyphens)
    if (invalidSlug.includes("-")) {
      const nameParts = invalidSlug.split("-");

      // If we have at least a first and last name component
      if (nameParts.length >= 2) {
        // Try to find by first and last name
        const firstName = nameParts[0];
        // Last name could be multiple parts, join them
        const lastName = nameParts.slice(1).join(" ");

        console.log(
          "Middleware: Searching by hyphenated name:",
          firstName,
          lastName,
        );

        const { data: nameResults, error: nameError } = await supabase
          .from("therapists")
          .select(`
            id, first_name, last_name, slug, clinic_country, clinic_province
          `)
          .ilike("first_name", `%${firstName}%`)
          .ilike("last_name", `%${lastName}%`)
          .limit(1);

        if (nameResults && nameResults.length > 0) {
          const therapist = nameResults[0];
          console.log(
            "Middleware: Found therapist by hyphenated name:",
            therapist,
          );

          // Redirect to correct URL format with proper slug (308 permanent redirect)
          return NextResponse.redirect(
            new URL(
              `/therapists/${country}/${region}/${therapist.slug}`,
              request.url,
            ),
            { status: 308 },
          );
        }
      }
    }

    // CASE 2: Try to find by single name (for cases like /therapists/ca/bc/sarah)
    // This handles the case where only a partial name is provided
    console.log("Middleware: Searching by single name component:", invalidSlug);

    const { data: singleNameResults, error: singleNameError } = await supabase
      .from("therapists")
      .select(`
        id, first_name, last_name, slug, clinic_country, clinic_province
      `)
      .or(`first_name.ilike.%${invalidSlug}%,last_name.ilike.%${invalidSlug}%`)
      .limit(1);

    if (singleNameResults && singleNameResults.length > 0) {
      const therapist = singleNameResults[0];
      console.log(
        "Middleware: Found therapist by single name component:",
        therapist,
      );

      // Redirect to correct URL format with proper slug (308 permanent redirect)
      return NextResponse.redirect(
        new URL(
          `/therapists/${country}/${region}/${therapist.slug}`,
          request.url,
        ),
        { status: 308 },
      );
    }

    // No match found - redirect to not found page with search parameter
    return NextResponse.redirect(
      new URL(
        `/therapists/not-found?q=${encodeURIComponent(invalidSlug)}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error("Middleware error for invalid slug format:", error);
    // In case of error, redirect to the not found page with the search term
    return NextResponse.redirect(
      new URL(
        `/therapists/not-found?q=${encodeURIComponent(invalidSlug || "")}`,
        request.url,
      ),
    );
  }
}

// Helper function to handle old therapist URLs
async function handleOldTherapistUrl(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const oldSlug = pathname.split("/")[2];

  console.log("Middleware: Handling old therapist URL with slug:", oldSlug);

  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, try to find therapist by partial slug
    const { data: therapistResults, error } = await supabase
      .from("therapists")
      .select(`
        id, first_name, last_name, slug, clinic_country, clinic_province
      `)
      .like("slug", `${oldSlug}%`)
      .limit(1);

    if (error) {
      console.error(
        "Middleware: Error searching for therapist by slug:",
        error,
      );
      // Redirect to not found page with search query
      return NextResponse.redirect(
        new URL(
          `/therapists/not-found?q=${encodeURIComponent(oldSlug)}`,
          request.url,
        ),
      );
    }

    // If found a matching therapist, redirect to the new URL format
    if (therapistResults && therapistResults.length > 0) {
      const therapist = therapistResults[0];
      console.log("Middleware: Found therapist by slug:", therapist);

      // Get country and province (lowercase for URL)
      const country = (therapist.clinic_country || "ca").toLowerCase();
      const province = (therapist.clinic_province || "bc").toLowerCase();

      // Redirect to new URL format (308 permanent redirect)
      return NextResponse.redirect(
        new URL(
          `/therapists/${country}/${province}/${therapist.slug}`,
          request.url,
        ),
        { status: 308 },
      );
    }

    // Add a single-word search as well - for slugs without hyphens
    if (!oldSlug.includes("-")) {
      console.log("Middleware: Searching by single-word:", oldSlug);

      // Try to find by either first OR last name since we don't know which one it is
      const { data: singleWordResults, error: singleWordError } = await supabase
        .from("therapists")
        .select(`
          id, first_name, last_name, slug, clinic_country, clinic_province
        `)
        .or(`first_name.ilike.%${oldSlug}%,last_name.ilike.%${oldSlug}%`)
        .limit(1);

      if (singleWordResults && singleWordResults.length > 0) {
        const therapist = singleWordResults[0];
        console.log("Middleware: Found therapist by single word:", therapist);

        // Get country and province (lowercase for URL)
        const country = (therapist.clinic_country || "ca").toLowerCase();
        const province = (therapist.clinic_province || "bc").toLowerCase();

        // Redirect to new URL format (308 permanent redirect)
        return NextResponse.redirect(
          new URL(
            `/therapists/${country}/${province}/${therapist.slug}`,
            request.url,
          ),
          { status: 308 },
        );
      }
    }

    // If no exact match, attempt name-based search (split the slug into name components)
    if (oldSlug.includes("-")) {
      const nameParts = oldSlug.split("-");

      // If we have at least a first and last name component
      if (nameParts.length >= 2) {
        // Try to find by first and last name
        const firstName = nameParts[0];
        // Last name could be multiple parts, join them
        const lastName = nameParts.slice(1).join(" ");

        console.log("Middleware: Searching by name:", firstName, lastName);

        const { data: nameResults, error: nameError } = await supabase
          .from("therapists")
          .select(`
            id, first_name, last_name, slug, clinic_country, clinic_province
          `)
          .ilike("first_name", `%${firstName}%`)
          .ilike("last_name", `%${lastName}%`)
          .limit(1);

        if (nameResults && nameResults.length > 0) {
          const therapist = nameResults[0];
          console.log("Middleware: Found therapist by name:", therapist);

          // Get country and province (lowercase for URL)
          const country = (therapist.clinic_country || "ca").toLowerCase();
          const province = (therapist.clinic_province || "bc").toLowerCase();

          // Redirect to new URL format (308 permanent redirect)
          return NextResponse.redirect(
            new URL(
              `/therapists/${country}/${province}/${therapist.slug}`,
              request.url,
            ),
            { status: 308 },
          );
        }
      }
    }

    // No match found - redirect to not found page with search parameter
    return NextResponse.redirect(
      new URL(
        `/therapists/not-found?q=${encodeURIComponent(oldSlug)}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, redirect to the not found page with the search term if available
    return NextResponse.redirect(
      new URL(
        `/therapists/not-found?q=${encodeURIComponent(oldSlug || "")}`,
        request.url,
      ),
    );
  }
}

// Define matcher for all routes we want middleware to run on
export const config = {
  matcher: [
    // Clerk auth routes
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    // Ensure therapist URLs are included
    "/therapists/:path*",
  ],
};
