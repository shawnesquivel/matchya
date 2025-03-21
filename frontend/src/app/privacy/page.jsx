import React from "react";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="bg-grey min-h-screen px-2 lg:px-20 md:px-10 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden border-grey-dark border p-6">
        <Link
          href={`/`}
          className="flex items-center gap-2 text-black hover:-translate-x-1 transition-transform mb-6"
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
          <span>Chat with Matchya</span>
        </Link>
        <Link
          href={"https://matchya.app"}
          className="flex items-center gap-2 text-black hover:-translate-x-1 transition-transform mb-6"
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
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Matchya's Privacy Policy
        </h1>
        <p className="text-black mb-4">Last updated: July 23, 2024</p>

        {sections.map((section, index) => (
          <section key={index} className="mb-6">
            <h2 className="text-2xl font-semibold text-black mb-2">
              {section.title}
            </h2>
            <p className="text-black">{section.content}</p>
            {section.list && (
              <ul className="list-disc pl-6 mt-2 text-black">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

const sections = [
  {
    title: "Introduction",
    content:
      "Welcome to Matchya. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. This policy also explains how we handle Google user data when you use our service.",
  },
  {
    title: "Information Collection and Use",
    content:
      "We collect minimal information necessary to provide our services:",
    list: [
      "For therapists (our customers): email and username.",
      "For general users: We do not collect or store personal data beyond basic access logs.",
    ],
  },
  {
    title: "Google User Data",
    content:
      "When you sign in with Google, we only access your email and username. We use this information solely to create and manage your therapist profile. We do not access, store, or use any other Google user data. We do not share your Google user data with third parties.",
  },
  {
    title: "Data Retention and Deletion",
    content:
      "We delete data from all user chats every 24 hours. Therapists can delete their profile at any time through their account settings. When a profile is deleted, all associated data is permanently removed from our systems.",
  },
  {
    title: "Revoking Access to Google Data",
    content:
      "You can revoke Matchya's access to your Google data at any time by deleting your user account through the Clerk authentication service. This will remove all your data from our systems.",
  },
  {
    title: "Data Security",
    content:
      "We are committed to protecting your data. We implement industry-standard security measures including:",
    list: [
      "Encryption of data in transit and at rest",
      "Regular security audits and vulnerability assessments",
      "Strict access controls and authentication procedures for our staff",
      "Continuous monitoring for potential security threats",
    ],
  },
  {
    title: "Users Under 13",
    content:
      "Our services are not directed to children under 13. We do not knowingly collect or store personal information from children under 13. If we learn that we have collected personal information of a child under 13, we will take steps to delete such information as soon as possible.",
  },
  {
    title: "Compliance with Google API Services User Data Policy",
    content: "We comply with Google's Limited Use requirements. Specifically:",
    list: [
      "We only use Google user data to provide and improve the Matchya service.",
      "We do not transfer this data to others or use it for serving ads.",
      "We do not allow humans to read this data unless explicitly authorized by users, necessary for security purposes, or required by law.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    content:
      'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.',
  },
  {
    title: "Contact Information",
    content:
      "If you have any questions about this Privacy Policy or wish to exercise any of your data protection rights, please contact us at weeknightsandweekends@gmail.com",
  },
];

export default PrivacyPolicy;
