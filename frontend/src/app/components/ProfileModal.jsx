import React, { useState, useEffect } from "react";

const ProfileModal = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("info");
  return (
    <>
      <div className="absolute bg-gray-800 bg-opacity-10 w-full h-full flex flex-row justify-end">
        <div className="bg-white w-6/12 p-12 flex flex-col gap-8">
          <div className="flex flex-row justify-between">
            <a
              href="/profile"
              className="flex items-center gap-2 text-grey-extraDark hover:-translate-x-1 transition-transform"
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
              <span>back to chat</span>
            </a>
            <a
              href="#"
              target="_blank"
              className="wfull bg-mblack text-white px-4 py-3 rounded-full flex align-middle justify-center"
            >
              book with
            </a>
          </div>
          <div className="flex gap-8">
            <div className="relative h-20 w-20 aspect-square">
              <img
                src="#"
                // alt={`profile pic ${metadata.name}`}
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

                <p className="md:text-m text-sm">location</p>
              </div>
              <p className="md:text-3xl text-xl">name</p>
            </div>
          </div>
          <div className="w-full flex gap-14 justify-center">
            <button
              onClick={() => setActiveTab("info")}
              className={`relative py-1 px-2 text-left w-fit ${
                activeTab === "info" ? "text-gray-800" : "text-gray-600"
              } transition-all duration-300 group`}
            >
              info
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
          </div>
          {activeTab === "info" && (
            <div className="w-full">
              <div className="profile-field">
                <p>
                  Lorem ipsum dolor sit amet consectetur. Senectus tempor sed
                  enim orci. Arcu id quam lacus vitae sagittis erat suspendisse
                  ut quis. Pharetra phasellus consequat orci sed posuere. Tortor
                  tempor lectus mi morbi vitae. Quisque nibh felis cursus eu
                  lorem nibh. Bibendum nisi elementum ac nisl nibh vel. Quis
                  faucibus dolor consequat lacus.
                </p>
              </div>
            </div>
          )}
          {activeTab === "specialties" && (
            <div className="w-full">
              <div className="profile-field">
                <p>
                  Lorem ipsum dolor sit amet consectetur. Senectus tempor sed
                  enim orci. Arcu id quam lacus vitae sagittis erat suspendisse
                  ut quis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
