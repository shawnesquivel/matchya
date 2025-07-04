import React from "react";

interface CrisisResourcesProps {
  onReturn?: () => void;
}

const CRISIS_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7, free and confidential support for people in distress",
    availability: "24/7",
    country: "US",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Free, 24/7 support via text message",
    availability: "24/7",
    country: "US",
  },
  {
    name: "Canada Suicide Prevention Service",
    phone: "1-833-456-4566",
    description: "24/7 support in English and French",
    availability: "24/7",
    country: "Canada",
  },
  {
    name: "Kids Help Phone (Canada)",
    phone: "1-800-668-6868",
    description: "Support for children, teens, and young adults",
    availability: "24/7",
    country: "Canada",
  },
];

const IMMEDIATE_ACTIONS = [
  {
    icon: "🚨",
    title: "If you are in immediate danger",
    description: "Call 911 (US/Canada) or your local emergency services immediately",
    urgent: true,
  },
  {
    icon: "🏥",
    title: "Go to your nearest emergency room",
    description: "If you are having thoughts of suicide or self-harm",
    urgent: true,
  },
  {
    icon: "👥",
    title: "Contact a trusted person",
    description: "Reach out to a family member, friend, or mental health professional",
    urgent: false,
  },
  {
    icon: "🔒",
    title: "Create a safe environment",
    description: "Remove or secure any items that could be used for self-harm",
    urgent: false,
  },
];

export default function CrisisResources({ onReturn }: CrisisResourcesProps) {
  return (
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-2">Crisis Support Resources</h1>
            <p className="text-red-700 text-lg">
              You are not alone. Professional help is available 24/7.
            </p>
          </div>

          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold text-center">
              ⚠️ Our AI therapy chat is not appropriate for crisis situations. Please use the
              resources below for immediate professional support.
            </p>
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Immediate Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {IMMEDIATE_ACTIONS.map((action, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  action.urgent ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3
                      className={`font-semibold ${
                        action.urgent ? "text-red-800" : "text-orange-800"
                      }`}
                    >
                      {action.title}
                    </h3>
                    <p className={`text-sm ${action.urgent ? "text-red-700" : "text-orange-700"}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Hotlines */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Crisis Hotlines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {CRISIS_RESOURCES.map((resource, index) => (
              <div key={index} className="border border-grey-light rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-mblack">{resource.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {resource.country}
                  </span>
                </div>
                <div className="mb-2">
                  <a
                    href={`tel:${resource.phone.replace(/[^\d]/g, "")}`}
                    className="text-lg font-bold text-blue-600 hover:underline"
                  >
                    {resource.phone}
                  </a>
                  <span className="text-sm text-grey ml-2">({resource.availability})</span>
                </div>
                <p className="text-sm text-grey">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Additional Support</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-mblack">Find a Mental Health Professional</h3>
              <p className="text-sm text-grey">
                Use our therapist directory to find qualified mental health professionals in your
                area.
              </p>
              <a
                href="/therapists/browse"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Browse Therapists →
              </a>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-mblack">Crisis Chat Support</h3>
              <p className="text-sm text-grey">
                Many crisis lines also offer online chat support if you prefer text communication.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-mblack">Mobile Apps for Crisis Support</h3>
              <p className="text-sm text-grey">
                Consider downloading crisis support apps like "MY3" or "Crisis Text Line" for quick
                access to help.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Planning */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Create a Safety Plan</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">A safety plan can include:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Warning signs that a crisis might be developing</li>
              <li>• Coping strategies that have helped you before</li>
              <li>• People you can contact for support</li>
              <li>• Professional contacts (therapist, doctor, crisis line)</li>
              <li>• Ways to make your environment safer</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Work with a mental health professional to create a personalized safety plan.
            </p>
          </div>
        </div>

        {/* Return Button */}
        {onReturn && (
          <div className="text-center">
            <button
              onClick={onReturn}
              className="bg-grey-light text-mblack px-6 py-3 rounded-lg hover:bg-grey transition-colors"
            >
              ← Return to Previous Page
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-grey">
          <p>
            This page provides general crisis resources. If you are in immediate danger, please
            contact emergency services in your area.
          </p>
        </div>
      </div>
    </div>
  );
}
