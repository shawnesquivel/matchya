export const fetchPineconeProfile = async (bioLink) => {
  if (!bioLink) {
    console.warn("No bio link supplied");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/profile?bio_link=${encodeURIComponent(
        bioLink
      )}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json();
    console.log("fetchPineconeProfile", data);
    return data?.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updatePineconeProfileSubscription = async (
  clerkUserId,
  stripeCustomerId,
  stripeSubscriptionId
) => {
  console.log("Calling updatePineconeProfileSubscription");

  // Fetch API call to the Lambda function
  // Return the status of the call

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/profile/subscription`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkUserId,
          stripeCustomerId,
          stripeSubscriptionId,
        }),
      }
    );
    console.log("updatePineconeProfileSubscription", response);

    if (!response.ok) {
      throw new Error("Failed to update Pinecone profile subscription");
    }

    return response.status;
  } catch (error) {
    console.error("Error updating Pinecone profile subscription:", error);
    return null;
  }
};
