import { ALLOWED_IMAGE_DOMAINS } from "@/config/images";

/**
 * Returns a safe image URL for use in Image components.
 */
export const getSafeImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    console.log("[getSafeImageUrl] No URL provided, returning default");
    return "/assets/images/default-pp.png";
  }

  try {
    const urlObj = new URL(url);

    const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.includes(
      urlObj.hostname as any,
    );

    if (!isAllowedDomain) {
      console.warn(
        `URL hostname "${urlObj.hostname}" is not allowed. Check next.config.js and config/images.ts`,
      );
    }
    return isAllowedDomain ? url : "/assets/images/default-pp.png";
  } catch (error) {
    console.error(
      `[getSafeImageUrl] Error processing domain ${url}, falling back to default.`,
      error,
    );
    return "/assets/images/default-pp.png";
  }
};
