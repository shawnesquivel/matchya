import React from "react";
import PrimaryBtn from "../components/PrimaryBtn";
import { aspekta } from "../styles/fonts";
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div
      className={`md:h-screen bg-white gap-2 flex flex-col p-4 h-full ${aspekta.className} transition ease-in-out`}
      id="page-layout"
    >
      <div className="md:bg-grey px-2 pt-0 lg:gap-6 lg:px-20 md:px-10 md:rounded-2xl h-full z-10 md:overflow-hidden relative">
        <div
          className="absolute lg:w-6/12 lg:h-full md:right-0 lg:top-0 z-0 w-full h-1/2 bottom-0 hidden md:block"
          style={{
            backgroundImage: 'url("/assets/images/couch.jpeg")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="lg:py-8 px-2 py-4 lg:px-20 md:px-10 flex flex-row md:justify-between lg:absolute w-full top-0 left-0">
          <img
            src="/assets/images/matchya-for-therapists.png"
            className="w-auto md:h-11 h-8"
            alt="matchya for therapists"
          />
          {/* <div className="flex-row gap-2 md:flex hidden">
            <PrimaryBtn
              text="Log In"
              onClick={undefined}
              className="border-green-light"
            />
            <PrimaryBtn
              text="Get Started"
              onClick={undefined}
              className="bg-green-light"
            />
          </div> */}
        </div>

        <div
          className="lg:grid lg:grid-cols-2 lg:justify-center lg:h-full lg:my-auto flex flex-col md:py-20 md:gap-16 gap-4"
          id="two-panels"
        >
          <div className="flex flex-col lg:gap-14 gap-4 justify-center">
            <a
              href="/"
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
              <span>Back to matchya directory</span>
            </a>

            <div className="flex flex-col md:gap-6 gap-2 lg:text-left text-center">
              <h1 className="lg:text-7xl text-3xl">Go Live, Get Clients</h1>
              <h2 className="lg:text-2xl text-md">
                Get your profile live in ~3 minutes and let our system handle
                client acquisition for you.
              </h2>
            </div>
            {/* <input type="text" placeholder="Your Email" />
          <button
            className="bg-green-300"
            onClick={() => {
              console.log("To Do: Create Profile in Clerk");
              setSignedUp(true);
            }}
          >
            Sign Up
          </button> */}
          </div>

          <div className="flex items-center justify-center" id="">
            <SignUp forceRedirectUrl="/profile" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
