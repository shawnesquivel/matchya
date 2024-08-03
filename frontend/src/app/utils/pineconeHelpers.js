export const fetchPineconeProfile = async (bioLink) => {
  if (!bioLink) {
    console.warn("Warning: No bio link supplied");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/profile?bio_link=${encodeURIComponent(
        bioLink
      )}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    const data = await response.json();
    console.log("fetchPineconeProfile", data);
    return data?.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};
