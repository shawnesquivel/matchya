"use client";
import React, { useState } from "react";
import PrimaryBtn from "../components/PrimaryBtn";
import { aspekta } from "../styles/fonts";
import DeleteIcon from "../components/DeleteIcon";

const EditProfileForm = () => {
  const [activeTab, setActiveTab] = useState("info");
  console.log("To Do: Fetch profile data from web scrape component");
  const [profileData, setProfileData] = useState({
    name: "Isabelle St-Jean",
    gender: "female",
    location: "Vancouver, B.C.",
    country: "Canada",
    languages: ["English", "French"],
    qualifications: [
      "Registered Social Worker",
      "Registered Therapeutic Counsellor",
      "Professional Certified Coach (with International Coach Federation accreditation)",
      "Certified Retirement Coach",
    ],
    specialties: [
      "Anxiety related disorders",
      "Depression",
      "Trauma",
      "Relationship Issues",
      "Major Life Transitions",
      "Retirement Issues",
      "Midlife Issues",
      "Business/Professional Challenges",
      "Workplace challenges",
    ],
    approaches: [
      "Cognitive Behavioural Therapy (CBT)",
      "Brainspotting",
      "Internal Family Systems (IFS)",
      "Coherence Therapy",
      "Gestalt Therapy",
      "Neuro Linguistic Programming (NLP)",
      "Emotional Freedom Technique (EFT)",
      "Relational Somatic Therapy",
      "Trauma Informed Therapies",
      "Mindfulness Coaching",
    ],
    available_online: true,
    bio: "As a therapist with over 20 years experience I have an uncommon ability to identify and mirror back the inner gifts of my clients while supporting them to clearly see and transcend their limitations. My counselling and coaching style includes unique, transformative exercises leading to expansive ways of thinking and being, that bring exciting possibilities within reach. I gently support and challenge my clients to be accountable as they take steps to successfully navigate difficult mental states, relationship issues, and major life transitions. My therapeutic skills draw on studies and training in: Cognitive Behavioural Therapy (CBT), Brainspotting, Internal Family Systems (IFS), Coherence Therapy, Gestalt Therapy, Neuro Linguistic Programming (NLP), Emotional Freedom Technique (EFT), Relational Somatic Therapy, Trauma Informed Therapies, Mindfulness Coaching. I work with a wide range of individuals who struggle with: Anxiety related disorders, Depression, Trauma, Relationship Issues, Major Life Transitions, Retirement Issues, Midlife Issues, Business/Professional Challenges, Workplace challenges. Originally from Montreal, and French speaking, I am a Registered Social Worker, a Registered Therapeutic Counsellor with intensive experience in somatic trauma therapy, a Professional Certified Coach (with International Coach Federation accreditation), a Certified Retirement Coach. I am also the author of Living Forward Giving Back: A Practical Guide to Fulfilment in Midlife and Beyond as well as the initiator and co-author of two award-winning anthologies: Einstein’s Business: Engaging Soul, Imagination and Excellence in the Workplace and Audacious Aging. Since 2009, I have led seminars coast to coast and internationally for professional communities and have provided counselling, coaching, to numerous individuals, couples and executives helping them with workplace or personal challenges and career development. As former member of the BC Human Resources Management Association, I have contributed years of knowledge to HR professionals through the publication of over 30 articles in the PeopleTalk magazine. Finally, I am also a caring consultant in the lives of my young adult children who are now 25 and 28.",
    bio_link:
      "https://anxietyandstressrelief.com/isabelle-st-jean-rsw-pcc-rtc/",
    booking_link: "https://anxietyandstressrelief.com/request-an-appointment/",
    clinic: "Alpine Counselling Clinic",
    fees: [""],
    profile_link:
      "https://anxietyandstressrelief.com/wp-content/uploads/2020/10/Isabelles-best-pic-150x150.jpg",
    short_summary:
      "Isabelle St-Jean specializes in anxiety-related disorders, depression, trauma, and relationship issues. She offers a range of therapeutic approaches including CBT, Brainspotting, and Mindfulness Coaching, and is available for online sessions from Vancouver, B.C., Canada.",
    summary:
      "Isabelle St-Jean is a highly experienced therapist based in Vancouver, B.C., Canada, offering online sessions through the Alpine Counselling Clinic. With over 20 years of experience, she specializes in a wide range of therapeutic approaches to help clients navigate difficult mental states and life transitions.",
    email: "isabelle.stjean@gmail.com",
    verified: true,
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [newChips, setNewChips] = useState({
    languages: "",
    qualifications: "",
    specialties: "",
    approaches: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // const handleArrayChange = (e, field, index) => {
  //   const newArray = [...profileData[field]];
  //   newArray[index] = e.target.value;
  //   setProfileData({
  //     ...profileData,
  //     [field]: newArray,
  //   });
  // };

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

  // const renderArrayInputs = (array, fieldName) => {
  //   return array.map((item, index) => (
  //     <div key={index}>
  //       <input
  //         type="text"
  //         value={item}
  //         onChange={(e) => handleArrayChange(e, fieldName, index)}
  //       />
  //     </div>
  //   ));
  // };
  // const renderArrayInputs = (array, fieldName) => {
  //   return array.map((item, index) => (
  //     <div key={index} className="flex items-center rounded-full">
  //       <input
  //         type="text"
  //         value={item}
  //         onChange={(e) => handleArrayChange(e, fieldName, index)}
  //         className="px-3 py-1 flex w-fit"
  //       />
  //       <button onClick={() => handleDeleteItem(fieldName, index)}>
  //         <DeleteIcon />
  //       </button>
  //     </div>
  //   ));
  // };
  // const renderArrayInputs = (array, fieldName) => {
  //   return array.map((item, index) => (
  //     <div
  //       key={index}
  //       className="text-sm flex items-center bg-gray-50 rounded-full rounded-full py-1 px-3 border relative hover:bg-white transition-colors"
  //     >
  //       {editingIndex === index ? (
  //         <input
  //           type="text"
  //           value={item}
  //           onChange={(e) => handleArrayChange(e, fieldName, index)}
  //           onBlur={() => setEditingIndex(null)}
  //           className="flex w-fit"
  //           autoFocus
  //         />
  //       ) : (
  //         <div
  //           className=" w-fit  border-gray-300  cursor-pointer"
  //           onClick={() => setEditingIndex(index)}
  //         >
  //           {item}
  //         </div>
  //       )}
  //       <button
  //         onClick={() => handleDeleteItem(fieldName, index)}
  //         className="ml-2"
  //       >
  //         <DeleteIcon />
  //       </button>
  //     </div>
  //   ));
  // };
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
        {array.map((item, index) => (
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
  // // Handle deletion of an item in array fields
  // const handleDeleteItem = (field, index) => {
  //   const newArray = [...profileData[field]];
  //   newArray.splice(index, 1);
  //   setProfileData({
  //     ...profileData,
  //     [field]: newArray,
  //   });
  // };

  // const handleDeleteItem = (field, index) => {
  //   const newArray = [...profileData[field]];
  //   newArray.splice(index, 1);
  //   setProfileData({
  //     ...profileData,
  //     [field]: newArray,
  //   });
  // };
  const saveProfile = () => {
    console.log("To Do: Send this profile data to Clerk to update metadata");
    console.log("To Do: Send this profile data to Pinecone to update metadata");
    console.log(JSON.stringify(profileData, null, 2));
  };

  return (
    <>
      <div
        className={`bg-white gap-2 flex flex-col p-4 h-full ${aspekta.className} transition ease-in-out`}
      >
        <div className="bg-grey px-2 pt-0 flex flex-col lg:gap-6 lg:px-20 lg:py-16 md:px-10 rounded-2xl h-full z-10 overflow-hidden relative">
          {" "}
          <div className="flex w-full justify-between items-center">
            <h1 className="text-2xl font-bold">
              Awesome! Here’s what we’ve found about you:
            </h1>
            <PrimaryBtn
              text="Save Profile"
              onClick={saveProfile}
              className="border-green-light"
            />
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
                      value={profileData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Gender</label>
                    <input
                      type="text"
                      name="gender"
                      value={profileData.gender}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Clinic</label>
                    <input
                      type="text"
                      name="clinic"
                      value={profileData.clinic}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Available Online</label>
                    <input
                      type="checkbox"
                      name="available_online"
                      checked={profileData.available_online}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Fees</label>
                    <input
                      type="text"
                      name="fees"
                      value={profileData.fees.join(", ")}
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
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Bio Link</label>
                    <input
                      type="text"
                      name="bio_link"
                      value={profileData.bio_link}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Booking Link</label>
                    <input
                      type="text"
                      name="booking_link"
                      value={profileData.booking_link}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Profile Link</label>
                    <input
                      type="text"
                      name="profile_link"
                      value={profileData.profile_link}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
              {activeTab === "bio" && (
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="profile-field col-span-2">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-field col-span-2">
                    <label>Short Summary</label>
                    <textarea
                      name="short_summary"
                      value={profileData.short_summary}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="profile-field col-span-2">
                    <label>Summary</label>
                    <textarea
                      name="summary"
                      value={profileData.summary}
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
                          profileData.qualifications,
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
                          profileData.specialties,
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
                          profileData.approaches,
                          "approaches"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 
          <div className="grid grid-cols-[2fr_1fr] gap-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="profile-field">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Gender</label>
                  <input
                    // this should be select
                    type="text"
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-field">
                  <label>Clinic</label>
                  <input
                    type="text"
                    name="clinic"
                    value={profileData.clinic}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Available Online</label>
                  <input
                    type="checkbox"
                    name="available_online"
                    checked={profileData.available_online}
                    onChange={handleChange}
                  />
                </div>
                <div className="profile-field">
                  <label>Fees</label>
                  <input
                    type="text"
                    name="fees"
                    value={profileData.fees.join(", ")}
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
                    value={profileData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="profile-field">
                <label>Languages</label>
                <div className="chips-container">
                  <div className="chips">
                    {renderArrayInputs(profileData.languages, "languages")}
                  </div>
                </div>
              </div>
              <div className="profile-field">
                <label>Qualifications</label>
                <div className="chips-container">
                  <div className="chips">
                    {renderArrayInputs(
                      profileData.qualifications,
                      "qualifications"
                    )}
                  </div>
                </div>
              </div>
              <div className="profile-field">
                <label>Specialties</label>
                <div className="chips-container">
                  <div className="chips">
                    {renderArrayInputs(profileData.specialties, "specialties")}
                  </div>
                </div>
              </div>
              <div className="profile-field">
                <label>Approaches</label>
                <div className="chips-container">
                  <div className="chips">
                    {renderArrayInputs(profileData.approaches, "approaches")}
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <label>Bio Link</label>
                <input
                  type="text"
                  name="bio_link"
                  value={profileData.bio_link}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-field">
                <label>Booking Link</label>
                <input
                  type="text"
                  name="booking_link"
                  value={profileData.booking_link}
                  onChange={handleChange}
                />
              </div>

              <div className="profile-field">
                <label>Profile Link</label>
                <input
                  type="text"
                  name="profile_link"
                  value={profileData.profile_link}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-rows-3">
              <div className="profile-field">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-field">
                <label>Short Summary</label>
                <textarea
                  name="short_summary"
                  value={profileData.short_summary}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-field">
                <label>Summary</label>
                <textarea
                  name="summary"
                  value={profileData.summary}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div> */}
          {/* <button className="bg-green-500 text-white" onClick={saveProfile}>
            Save Profile (console.log(profileData))
          </button> */}
        </div>
      </div>
    </>
  );
};

export default EditProfileForm;
