import React, { useState, useEffect } from "react";
import useChatbot from "../hooks/useChatbot";
import { fetchPineconeProfile } from "../utils/pineconeHelpers";

const ProfileModal = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [userData, setUserData] = useState(null);

  // Pinecone Call to Fetch the UserID Data.
  useEffect(() => {
    const fetchPinecone = async () => {
      const data = await fetchPineconeProfile(userId);
      if (data) {
        setUserData(data);
      }
    };
    fetchPinecone();
  }, [userId]);

  if (!userData)
    return (
      <div className="absolute bg-gray-800 bg-opacity-10 w-full h-full flex flex-row justify-end">
        <div className="bg-white md:w-6/12 w-full p-12 flex flex-col gap-8">
          <button
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            back to chat
          </button>
          <div className="flex flex-row justify-between">
            Loading profile...
          </div>
        </div>
      </div>
    );

  return (
    <>
      <div className="absolute bg-gray-800 bg-opacity-10 w-full h-screen flex flex-row justify-end">
        <div className="bg-white md:w-6/12 w-full sm:p-12 p-4 flex flex-col sm:gap-8 gap-4 h-full">
          <div className="flex sm:flex-row flex-col justify-between">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="flex w-full items-center gap-2 text-grey-extraDark hover:-translate-x-1 transition-transform"
            >
              <svg
                width="9"
                height="8"
                viewBox="0 0 9 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.646447 3.42281C0.451184 3.61808 0.451184 3.93466 0.646447 4.12992L3.82843 7.3119C4.02369 7.50716 4.34027 7.50716 4.53553 7.3119C4.7308 7.11664 4.7308 6.80006 4.53553 6.60479L1.70711 3.77637L4.53553 0.94794C4.7308 0.752678 4.7308 0.436095 4.53553 0.240833C4.34027 0.0455707 4.02369 0.0455707 3.82843 0.240833L0.646447 3.42281ZM9 3.27637L1 3.27637L1 4.27637L9 4.27637L9 3.27637Z"
                  fill="#878787"
                />
              </svg>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
              >
                back to chat
              </button>
            </a>
            <div className="flex sm:gap-3 gap-1 justify-between w-full sm:justify-end">
              <a
                href={userData?.bio_link}
                target="_blank"
                className="wfull text-mblack px-4 py-3 rounded-full flex align-middle justify-center lowercase"
              >
                <div className="flex justify-center items-center mr-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_416_2225)">
                      <path
                        d="M7.00033 12.8337C10.222 12.8337 12.8337 10.222 12.8337 7.00033C12.8337 3.77866 10.222 1.16699 7.00033 1.16699C3.77866 1.16699 1.16699 3.77866 1.16699 7.00033C1.16699 10.222 3.77866 12.8337 7.00033 12.8337Z"
                        stroke="black"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.16699 7H12.8337"
                        stroke="black"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.00033 12.8337C8.289 12.8337 9.33366 10.222 9.33366 7.00033C9.33366 3.77866 8.289 1.16699 7.00033 1.16699C5.71165 1.16699 4.66699 3.77866 4.66699 7.00033C4.66699 10.222 5.71165 12.8337 7.00033 12.8337Z"
                        stroke="black"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M2.87598 2.95801C3.9316 4.01364 5.38994 4.66656 7.00075 4.66656C8.6116 4.66656 10.0699 4.01364 11.1256 2.95801"
                        stroke="black"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M11.1256 11.0425C10.0699 9.98691 8.6116 9.33398 7.00075 9.33398C5.38994 9.33398 3.9316 9.98691 2.87598 11.0425"
                        stroke="black"
                        stroke-width="1.16667"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_416_2225">
                        <rect width="14" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                website
              </a>
              <a
                href={userData?.booking_link}
                target="_blank"
                className="wfull bg-mblack text-white px-4 py-3 rounded-full flex align-middle justify-center lowercase"
              >
                book with {userData?.name.split(" ")[0]}
              </a>
            </div>
          </div>
          <div className="flex sm:gap-8 gap-4">
            <div className="relative h-20 w-20 aspect-square">
              <img
                src={
                  userData?.profile_link &&
                  userData.profile_link.startsWith("http") &&
                  userData.profile_link !== "None"
                    ? userData.profile_link
                    : "/assets/images/default-pp.png"
                }
                // alt={`profile pic ${userData?.name}`}
                className="aspect-square absolute inset-0 w-full h-full object-cover rounded-full"
              />
            </div>
            <div id="top-right" className="flex flex-col gap-1 my-auto">
              <div className="flex gap-1 items-center">
                <svg
                  width="11"
                  height="13"
                  viewBox="0 0 11 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.3589 5.17943C10.3589 8.03995 7 11 5.17943 13C3.5 11 0 8.03995 0 5.17943C0 2.31891 2.31891 0 5.17943 0C8.03995 0 10.3589 2.31891 10.3589 5.17943Z"
                    fill="#F3843C"
                  />
                </svg>

                <p className="md:text-m text-sm">{userData?.location}</p>
              </div>
              <p className="md:text-3xl text-xl">{userData?.name}</p>
            </div>
          </div>
          <div className="w-full flex sm:gap-14 justify-center gap-4">
            <button
              onClick={() => setActiveTab("info")}
              className={`relative py-1 px-2 text-left w-fit ${
                activeTab === "info" ? "text-gray-800" : "text-gray-600"
              } transition-all duration-300 group`}
            >
              summary
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                  activeTab === "info" ? "w-full" : "w-0"
                }`}
              ></span>
            </button>
            <button
              onClick={() => setActiveTab("specialties")}
              className={`relative py-1 px-2 text-left w-fit ${
                activeTab === "specialties" ? "text-gray-800" : "text-gray-600"
              } transition-all duration-300 group`}
            >
              specialties
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                  activeTab === "specialties" ? "w-full" : "w-0"
                }`}
              ></span>
            </button>
            <button
              onClick={() => setActiveTab("fees")}
              className={`relative py-1 px-2 text-left w-fit ${
                activeTab === "specialties" ? "text-gray-800" : "text-gray-600"
              } transition-all duration-300 group`}
            >
              fees
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-gray-600 transition-width duration-300 group-hover:w-full ${
                  activeTab === "fees" ? "w-full" : "w-0"
                }`}
              ></span>
            </button>
          </div>
          {activeTab === "info" && (
            <div className="w-full h-full overflow-y-scroll">
              <div className=" flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">About</p>
                  <p className="lg:text-md text-md leading-tight">
                    {userData?.bio}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "specialties" && (
            <div className="w-full h-full overflow-y-scroll">
              <div className=" flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">Works at</p>
                  <p className="lg:text-md text-md leading-tight">
                    {userData?.clinic}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">Speaks</p>
                  <p className="lg:text-md text-md leading-tight">
                    {userData?.languages}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">Qualifications</p>
                  <div className="">
                    <p className="lg:text-md text-md leading-tight">
                      {userData?.qualifications}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">Works with</p>
                  <ul className="flex gap-y-1 gap-x-2 wfull flex-wrap">
                    {userData.specialties.slice(0, 4).map((el, index) => (
                      <li className="whitespace-nowrap flex px-1 py-1 border border-orange rounded-full text-orange text-xs">
                        {el}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {activeTab === "fees" && (
            <div className="w-full h-full overflow-y-scroll">
              <div className=" flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <p className="uppercase text-xs">Pricing summary</p>
                  <ul className="flex flex-col gap-3">
                    {userData.fees.slice(0, 4).map((el, index) => (
                      <li className="tex-md">{el}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
