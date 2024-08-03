"use client";
import React, { useState, useEffect } from "react";
import PrimaryBtn from "../components/PrimaryBtn";
import { aspekta } from "../styles/fonts";
import DeleteIcon from "../components/DeleteIcon";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const EditProfileForm = ({ handleManualProfile }) => {
const { user } = useUser();
  const [editingIndex, setEditingIndex] = useState(null);
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
  const [activeTab, setActiveTab] = useState("info");
  const [newChips, setNewChips] = useState({
    languages: "",
    qualifications: "",
    specialties: "",
    approaches: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { unsafeMetadata } = user;
      const { profileSavedOnPinecone, webScrapeData, bio_link } =
        unsafeMetadata || {};
      const pineconeProfile = await fetchPineconeProfile(bio_link);
      console.log("fetch Pinecone Profile", pineconeProfile);
      if (pineconeProfile?.bio_link) {
        setProfileData({
          name: pineconeProfile.name || "",
          gender: pineconeProfile.gender || "male",
          location: pineconeProfile.location || "",
          country: pineconeProfile.country || "",
          clinic: pineconeProfile.clinic || "",
          available_online: pineconeProfile.available_online || false,
          fees: pineconeProfile.fees || [],
          email: pineconeProfile.emailAddress || "",
          bio_link: pineconeProfile.bio_link || "",
          booking_link: pineconeProfile.booking_link || "",
          profile_link: pineconeProfile.profile_link || "",
          bio: pineconeProfile.bio || "",
          short_summary: pineconeProfile.short_summary || "",
          summary: pineconeProfile.summary || "",
          languages: pineconeProfile.languages || [],
          qualifications: pineconeProfile.qualifications || [],
          specialties: pineconeProfile.specialties || [],
          approaches: pineconeProfile.approaches || [],
        });
        return;
      }

      // If no Pinecone data was found, check if there was a webscrape done.
      if (webScrapeData?.data) {
        const scrapeData = webScrapeData.data;
        setProfileData({
          name: scrapeData.name || "",
          gender: scrapeData.gender || "male",
          location: scrapeData.location || "",
          country: scrapeData.country || "",
          clinic: scrapeData.clinic || "",
          available_online: scrapeData.available_online || false,
          fees: scrapeData.fees || [],
          email: scrapeData.emailAddress || "",
          bio_link: scrapeData.bio_link || "",
          booking_link: scrapeData.booking_link || "",
          profile_link: scrapeData.profile_link || "",
          bio: scrapeData.bio || "",
          short_summary: scrapeData.short_summary || "",
          summary: scrapeData.summary || "",
          languages: scrapeData.languages || [],
          qualifications: scrapeData.qualifications || [],
          specialties: scrapeData.specialties || [],
          approaches: scrapeData.approaches || [],
        });
      } else {
        console.log("User unsafe metadata was empty.", unsafeMetadata);
      }
    };

    fetchData();
  }, [user]);

  if (user?.unsafeMetadata?.profileStarted === false) {
    return (
      <Link
        href={"/profile"}
        className="underline underline-offset-2 ml-16 mt-16"
      >
        Profile not started. Go to bio.
      </Link>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleArrayChange = (e, field, index) => {
    const newArray = [...profileData[field]];
    newArray[index] = e.target.value;
    setProfileData({
      ...profileData,
      [field]: newArray,
    });
  };

  const handleDeleteItem = (field, index) => {
    const newArray = [...profileData[field]];
    newArray.splice(index, 1);
    setProfileData({
      ...profileData,
      [field]: newArray,
    });
  };

  const handleAddChip = (field, value) => {
    if (value.trim() !== "") {
      const newArray = [...profileData[field], value.trim()];
      setProfileData({
        ...profileData,
        [field]: newArray,
      });
      setNewChips({ ...newChips, [field]: "" });
    }
  };

  const renderArrayInputs = (array, fieldName) => {
    return (
      <>
        {array?.map((item, index) => (
          <div
            key={index}
            className="text-xs flex items-center bg-gray-50 rounded-full py-1 px-3 border relative hover:bg-white transition-colors"
          >
            {editingIndex === index ? (
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(e, fieldName, index)}
                onBlur={() => setEditingIndex(null)}
                className="flex w-fit"
                autoFocus
              />
            ) : (
              <div
                className="w-fit border-gray-300 cursor-pointer"
                onClick={() => setEditingIndex(index)}
              >
                {item}
              </div>
            )}
            <button
              onClick={() => handleDeleteItem(fieldName, index)}
              className="ml-2"
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={newChips[fieldName]}
          onChange={(e) =>
            setNewChips({ ...newChips, [fieldName]: e.target.value })
          }
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAddChip(fieldName, newChips[fieldName]);
            }
          }}
          className="text-sm flex items-center bg-gray-50 rounded-full py-1 px-3 border relative hover:bg-white transition-colors"
          placeholder="Add new"
        />
      </>
    );
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/profile/update`;
      const body = JSON.stringify(profileData);
      console.log("fetching", url, body);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      console.log("Profile was saved!", data);
      if (user) {
        await user.update({
          unsafeMetadata: {
            profileSavedOnPinecone: true,
            profileStarted: true,
            bio_link: profileData.bio_link,
            webScrapeData: {},
          },
        });
      }
      setSavingProfile(false);
      setSuccess(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setSavingProfile(false);
    }
  };

  const determineProfileStatusText = () => {
    if (user?.unsafeMetadata?.profileSavedOnPinecone === true) {
      return <p>Status: Your profile is live!</p>;
    }

    if (user?.unsafeMetadata?.profileStarted === true) {
      return (
        <div className="flex flex-row gap-4">
          <span>Status: Your profile is not live yet.</span>
          <Link
            href={`/profile`}
            className="underline underline-offset-2"
            // go backwards
            onClick={(e) => handleManualProfile(e, false)}
          >
            Pre-fill my profile with a link.
          </Link>
        </div>
      );
    }

    return null;
  };

  const fetchPineconeProfile = async (bioLink) => {
    if (!bioLink) {
      console.warn("Warning: No bio link supplied");
      return null;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/profile?bio_link=${encodeURIComponent(bioLink)}`
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

  return (
    <>
      <div
        className={`bg-white gap-2 flex flex-col p-4 h-full lg:h-screen ${aspekta.className} transition ease-in-out`}
      >
        <div className="bg-grey px-2 pt-0 flex flex-col lg:gap-6 lg:px-20 lg:py-16 md:px-10 rounded-2xl h-full z-10 overflow-hidden relative">
          {" "}
          <div className="flex w-full justify-between items-center">
            {profileData?.name ? (
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">
                  Awesome! Here's what we've found about you:
                </h1>
                {determineProfileStatusText()}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">
                  Help clients find you by filling in your profile.
                </h1>
                <Link
                  href={`/profile`}
                  className="underline underline-offset-4"
                  onClick={(e) => handleManualProfile(e, false)}
                >
                  Pre-fill my profile with a link.
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-2 items-center">
              <PrimaryBtn
                text={`${savingProfile ? `Saving...` : `Save Profile`}`}
                onClick={saveProfile}
                className="border-green-light"
              />
              {success && <p className="text-xs">Your profile was saved.</p>}
            </div>
          </div>
          <div className="flex gap-6 h-full">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("info")}
                className={`relative py-1 px-2 text-left w-fit ${
                  activeTab === "info" ? "text-gray-800" : "text-gray-600"
                } transition-all duration-300 group`}
              >
                Info
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                    activeTab === "info" ? "w-full" : "w-0"
                  }`}
                ></span>
              </button>
              <button
                onClick={() => setActiveTab("bio")}
                className={`relative py-1 px-2 text-left w-fit ${
                  activeTab === "bio" ? "text-gray-800" : "text-gray-600"
                } transition-all duration-300 group`}
              >
                Bio
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                    activeTab === "bio" ? "w-full" : "w-0"
                  }`}
                ></span>
              </button>
              <button
                onClick={() => setActiveTab("qualifications")}
                className={`relative py-1 px-2 text-left w-fit ${
                  activeTab === "qualifications"
                    ? "text-gray-800"
                    : "text-gray-600"
                } transition-all duration-300 group`}
              >
                Expertise
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                    activeTab === "qualifications" ? "w-full" : "w-0"
                  }`}
                ></span>
              </button>
            </div>
            <div className="h-full w-full">
              {activeTab === "info" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="profile-field">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData?.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={profileData?.gender}
                      onChange={handleChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="profile-field">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileData?.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profileData?.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Clinic</label>
                    <input
                      type="text"
                      name="clinic"
                      value={profileData?.clinic}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Available Online</label>
                    <input
                      type="checkbox"
                      name="available_online"
                      checked={profileData?.available_online}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Fees</label>
                    <input
                      type="text"
                      name="fees"
                      value={profileData?.fees?.join(", ") || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fees: e.target.value.split(", "),
                        })
                      }
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData?.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <div className="flex flex-row gap-4">
                      <label>Bio Link</label>
                      <a
                        href={profileData?.bio_link}
                        target="_blank"
                        className="text-xs underline underline-offset-2"
                      >
                        Test Link
                      </a>
                    </div>
                    <input
                      type="text"
                      name="bio_link"
                      value={profileData?.bio_link}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <div className="flex flex-row gap-4">
                      <label>Booking Link</label>
                      <a
                        href={profileData?.booking_link}
                        target="_blank"
                        className="text-xs underline underline-offset-2"
                      >
                        Test Link
                      </a>
                    </div>

                    <input
                      type="text"
                      name="booking_link"
                      value={profileData?.booking_link}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Image Link</label>
                    <input
                      type="text"
                      name="profile_link"
                      value={profileData?.profile_link}
                      onChange={handleChange}
                    />
                    <p>Upload Profile Picture</p>
                  </div>
                </div>
              )}
              {activeTab === "bio" && (
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="profile-field col-span-2">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={profileData?.bio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-field col-span-2">
                    <label>Short Summary</label>
                    <textarea
                      name="short_summary"
                      value={profileData?.short_summary}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Summary</label>
                    <textarea
                      name="summary"
                      value={profileData?.summary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
              {activeTab === "qualifications" && (
                <div className="flex flex-col gap-4 h-full">
                  <div className="profile-field">
                    <label>Qualifications</label>
                    <div className="chips-container">
                      <div className="chips">
                        {renderArrayInputs(
                          profileData?.qualifications,
                          "qualifications"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Specialties</label>
                    <div className="chips-container">
                      <div className="chips">
                        {renderArrayInputs(
                          profileData?.specialties,
                          "specialties"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="profile-field">
                    <label>Approaches</label>
                    <div className="chips-container">
                      <div className="chips">
                        {renderArrayInputs(
                          profileData?.approaches,
                          "approaches"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileForm;
