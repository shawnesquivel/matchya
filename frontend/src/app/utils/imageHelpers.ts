import { ALLOWED_IMAGE_DOMAINS } from "@/config/images";

/**
 * Returns a safe image URL for use in Image components.
 * Falls back to a placeholder if the provided URL is invalid or undefined.
 */
export const getSafeImageUrl = (url: string | undefined | null): string => {
  console.log("getSafeImageUrl called with URL:", url);
  if (!url) {
    console.warn("No URL provided, returning default image.");
    return "/assets/images/default-pp.png";
  }

  try {
    const urlObj = new URL(url);
    const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.includes(
      urlObj.hostname as any,
    );
    console.log(
      `URL hostname "${urlObj.hostname}" is ${
        isAllowedDomain ? "allowed" : "not allowed"
      }.`,
    );
    return isAllowedDomain ? url : "/assets/images/default-pp.png";
  } catch (error) {
    console.error("Error creating URL object:", error);
    return "/assets/images/default-pp.png";
  }
};
