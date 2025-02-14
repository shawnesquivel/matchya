import { ALLOWED_IMAGE_DOMAINS } from "@/config/images";

export const getSafeImageUrl = (url: string | undefined | null): string => {
  if (!url) return "/assets/images/default-pp.png";

  try {
    const urlObj = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.includes(urlObj.hostname as any)
      ? url
      : "/assets/images/default-pp.png";
  } catch {
    return "/assets/images/default-pp.png";
  }
};
