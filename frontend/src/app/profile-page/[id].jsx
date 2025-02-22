// pages/profile/[id].js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

const TherapistProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profileData, setProfileData] = useState({
    name: "",
    gender: "male",
    location: "",
    country: "",
    clinic: "",
    available_online: false,
    fees: [],
    email: "",
    bio_link: "",
    booking_link: "",
    profile_link: "",
    bio: "",
    short_summary: "",
    summary: "",
    languages: [],
    qualifications: [],
    specialties: [],
    approaches: [],
  });

  useEffect(() => {
    if (id) {
      fetchProfileData(id);
    }
  }, [id]);

  const fetchProfileData = async (therapistId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/${therapistId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">{profileData.name}</h1>
        <p>
          <strong>Gender:</strong> {profileData.gender}
        </p>
        <p>
          <strong>Location:</strong> {profileData.location}
        </p>
        <p>
          <strong>Country:</strong> {profileData.country}
        </p>
        <p>
          <strong>Clinic:</strong> {profileData.clinic}
        </p>
        <p>
          <strong>Available Online:</strong>{" "}
          {profileData.available_online ? "Yes" : "No"}
        </p>
        <p>
          <strong>Fees:</strong> {profileData.fees.join(", ")}
        </p>
        <p>
          <strong>Email:</strong> {profileData.email}
        </p>
        <p>
          <strong>Bio Link:</strong>{" "}
          <a
            href={profileData.bio_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profileData.bio_link}
          </a>
        </p>
        <p>
          <strong>Booking Link:</strong>{" "}
          <a
            href={profileData.booking_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profileData.booking_link}
          </a>
        </p>
        <p>
          <strong>Profile Link:</strong>{" "}
          <a
            href={profileData.profile_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {profileData.profile_link}
          </a>
        </p>
        <p>
          <strong>Bio:</strong> {profileData.bio}
        </p>
        <p>
          <strong>Short Summary:</strong> {profileData.short_summary}
        </p>
        <p>
          <strong>Summary:</strong> {profileData.summary}
        </p>
        <p>
          <strong>Languages:</strong> {profileData.languages.join(", ")}
        </p>
        <p>
          <strong>Qualifications:</strong>{" "}
          {profileData.qualifications.join(", ")}
        </p>
        <p>
          <strong>Specialties:</strong> {profileData.specialties.join(", ")}
        </p>
        <p>
          <strong>Approaches:</strong> {profileData.approaches.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default TherapistProfilePage;
