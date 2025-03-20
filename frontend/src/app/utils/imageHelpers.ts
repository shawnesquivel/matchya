import { ALLOWED_IMAGE_DOMAINS } from "@/config/images";

/**
 * Returns a safe image URL for use in Image components.
 */
export const getSafeImageUrl = (url: string | undefined | null): string => {
  if (!url) return "/assets/images/default-pp.png";

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
  } catch {
    return "/assets/images/default-pp.png";
  }
};
