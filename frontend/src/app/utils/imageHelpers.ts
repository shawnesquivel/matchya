import { ALLOWED_IMAGE_DOMAINS } from "@/config/images";

export const getSafeImageUrl = (url: string | undefined | null): string => {
  if (!url) return "/default-therapist.jpg";

  try {
    const urlObj = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.includes(urlObj.hostname as any)
      ? url
      : "/default-therapist.jpg";
  } catch {
    return "/default-therapist.jpg";
  }
};
