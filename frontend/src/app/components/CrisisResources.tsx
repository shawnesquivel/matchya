import React from "react";

interface CrisisResourcesProps {
  onReturn?: () => void;
  onRetakeAssessment?: () => void;
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

export default function CrisisResources({ onReturn, onRetakeAssessment }: CrisisResourcesProps) {
  return (
    <div className="flex-1 flex items-start justify-center p-4 md:p-8 min-h-full bg-beige-extralight">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-orange"
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
          <h1 className="text-3xl font-light text-mblack mb-4 font-new-spirit">
            Professional Support Recommended
          </h1>
          <p className="text-grey-medium max-w-2xl mx-auto text-base leading-relaxed mb-6">
            Based on your responses, we recommend seeking immediate professional support. You are
            not alone, and help is available 24/7.
          </p>

          <div className="bg-orange/10 border border-orange/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-orange text-center font-medium">
              ⚠️ Our AI therapy chat is not appropriate for crisis situations. Please use the
              resources below for immediate professional support.
            </p>
          </div>
        </div>

        {/* Immediate Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-grey-light p-6 mb-6">
          <h2 className="text-xl font-medium text-mblack mb-6">Immediate Actions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {IMMEDIATE_ACTIONS.map((action, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  action.urgent
                    ? "border-orange/30 bg-orange/5 hover:border-orange/50"
                    : "border-grey-light bg-beige-extralight hover:border-green-light"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3
                      className={`font-medium mb-1 ${
                        action.urgent ? "text-orange" : "text-mblack"
                      }`}
                    >
                      {action.title}
                    </h3>
                    <p className="text-sm text-grey-medium leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Hotlines */}
        <div className="bg-white rounded-lg shadow-sm border border-grey-light p-6 mb-6">
          <h2 className="text-xl font-medium text-mblack mb-6">Crisis Hotlines</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {CRISIS_RESOURCES.map((resource, index) => (
              <div
                key={index}
                className="border border-grey-light rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-mblack">{resource.name}</h3>
                  <span className="text-xs bg-beige-light text-grey-medium px-2 py-1 rounded-full">
                    {resource.country}
                  </span>
                </div>
                <div className="mb-2">
                  <a
                    href={`tel:${resource.phone.replace(/[^\d]/g, "")}`}
                    className="text-lg font-medium text-green hover:text-green-dark transition-colors hover:underline"
                  >
                    {resource.phone}
                  </a>
                  <span className="text-sm text-grey-medium ml-2">({resource.availability})</span>
                </div>
                <p className="text-sm text-grey-medium leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-grey-light p-6 mb-6">
          <h2 className="text-xl font-medium text-mblack mb-6">Additional Support</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green pl-4">
              <h3 className="font-medium text-mblack mb-1">Find a Mental Health Professional</h3>
              <p className="text-sm text-grey-medium mb-2 leading-relaxed">
                Use our therapist directory to find qualified mental health professionals in your
                area.
              </p>
              <a
                href="/therapists/browse"
                className="text-green hover:text-green-dark transition-colors text-sm font-medium hover:underline"
              >
                Browse Therapists →
              </a>
            </div>

            <div className="border-l-4 border-orange pl-4">
              <h3 className="font-medium text-mblack mb-1">Crisis Chat Support</h3>
              <p className="text-sm text-grey-medium leading-relaxed">
                Many crisis lines also offer online chat support if you prefer text communication.
              </p>
            </div>

            <div className="border-l-4 border-purple pl-4">
              <h3 className="font-medium text-mblack mb-1">Mobile Apps for Crisis Support</h3>
              <p className="text-sm text-grey-medium leading-relaxed">
                Consider downloading crisis support apps like "MY3" or "Crisis Text Line" for quick
                access to help.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Planning */}
        <div className="bg-white rounded-lg shadow-sm border border-grey-light p-6 mb-6">
          <h2 className="text-xl font-medium text-mblack mb-6">Create a Safety Plan</h2>
          <div className="bg-beige-extralight border border-beige-dark rounded-lg p-4">
            <h3 className="font-medium text-mblack mb-3">A safety plan can include:</h3>
            <ul className="text-sm text-grey-medium space-y-1 leading-relaxed">
              <li>• Warning signs that a crisis might be developing</li>
              <li>• Coping strategies that have helped you before</li>
              <li>• People you can contact for support</li>
              <li>• Professional contacts (therapist, doctor, crisis line)</li>
              <li>• Ways to make your environment safer</li>
            </ul>
            <p className="text-xs text-grey-medium mt-3">
              Work with a mental health professional to create a personalized safety plan.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {onRetakeAssessment && (
            <div className="mb-6">
              <p className="text-sm text-grey-medium mb-3">
                If your situation has improved, you may retake the safety assessment:
              </p>
              <button
                onClick={onRetakeAssessment}
                className="bg-green text-white px-6 py-3 rounded-full hover:bg-green-dark transition-colors font-medium"
              >
                Retake Safety Assessment
              </button>
            </div>
          )}

          {onReturn && (
            <button
              onClick={onReturn}
              className="bg-beige-light text-mblack px-6 py-3 rounded-full hover:bg-beige-dark transition-colors font-medium"
            >
              ← Return to Previous Page
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-grey-medium">
          <p>
            This page provides general crisis resources. If you are in immediate danger, please
            contact emergency services in your area.
          </p>
        </div>
      </div>
    </div>
  );
}
