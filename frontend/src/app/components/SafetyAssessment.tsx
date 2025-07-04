import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface SafetyAssessmentProps {
  onComplete: (passed: boolean) => void;
  onSkip?: () => void;
}

const SAFETY_QUESTIONS = [
  {
    id: "suicide_ideation",
    question: "In the past 2 weeks, have you had thoughts of ending your life or suicide?",
    type: "yes_no" as const,
    riskLevel: "high" as const,
  },
  {
    id: "self_harm",
    question:
      "In the past month, have you intentionally hurt yourself or had thoughts of hurting yourself?",
    type: "yes_no" as const,
    riskLevel: "high" as const,
  },
  {
    id: "harm_others",
    question: "Have you had thoughts of hurting someone else or acting violently toward others?",
    type: "yes_no" as const,
    riskLevel: "high" as const,
  },
  {
    id: "psychosis",
    question:
      "Are you currently experiencing hallucinations (seeing/hearing things others don't) or delusions (beliefs others find unusual)?",
    type: "yes_no" as const,
    riskLevel: "high" as const,
  },
  {
    id: "crisis_state",
    question:
      "Are you currently in a mental health crisis or emergency situation that requires immediate professional help?",
    type: "yes_no" as const,
    riskLevel: "high" as const,
  },
];

export default function SafetyAssessment({ onComplete, onSkip }: SafetyAssessmentProps) {
  const { user } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const questionId = SAFETY_QUESTIONS[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // If this is the last question, submit
    if (currentQuestion === SAFETY_QUESTIONS.length - 1) {
      submitAssessment(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitAssessment = async (finalAnswers: Record<string, boolean>) => {
    setIsSubmitting(true);

    try {
      // Check if any high-risk answers are "yes"
      const hasHighRiskAnswers = SAFETY_QUESTIONS.some(
        (q) => q.riskLevel === "high" && finalAnswers[q.id] === true
      );

      console.log("🔍 Safety Assessment Debug:", {
        answers: finalAnswers,
        hasHighRiskAnswers,
        passed: !hasHighRiskAnswers,
      });

      // Update user profile with assessment results
      const response = await fetch("/api/safety-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          answers: finalAnswers,
          passed: !hasHighRiskAnswers,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Safety assessment API error:", errorData);
        throw new Error(`Failed to save assessment: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Safety assessment saved:", result);

      // Call completion handler
      onComplete(!hasHighRiskAnswers);
    } catch (error) {
      console.error("❌ Error submitting safety assessment:", error);
      // For safety, if there's an error, we'll assume they didn't pass
      onComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = SAFETY_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / SAFETY_QUESTIONS.length) * 100;

  return (
    <div className="flex-1 flex items-start md:items-center justify-center p-4 md:p-8 min-h-full bg-beige-extralight">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-mblack mb-4 font-new-spirit">
            Safety Assessment
          </h1>
          <p className="text-grey-medium max-w-xl mx-auto text-base leading-relaxed">
            Before we begin, we need to ensure this service is appropriate for your current needs.
            This brief assessment helps us provide you with the most suitable support.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg p-6 md:p-8 border border-grey-light shadow-sm mb-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-grey-medium mb-2">
              <span>
                Question {currentQuestion + 1} of {SAFETY_QUESTIONS.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-grey-light rounded-full h-2">
              <div
                className="bg-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-medium text-mblack mb-6">{currentQ.question}</h2>

            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(false)}
                disabled={isSubmitting}
                className="w-full p-4 text-left border border-grey-light rounded-lg hover:border-green-light hover:bg-green/5 transition-all duration-200 group disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-grey-light rounded-full mr-3 flex items-center justify-center group-hover:border-green transition-colors">
                    <div className="w-2 h-2 bg-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-mblack group-hover:text-green-dark transition-colors">
                    No
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleAnswer(true)}
                disabled={isSubmitting}
                className="w-full p-4 text-left border border-grey-light rounded-lg hover:border-orange hover:bg-orange/5 transition-all duration-200 group disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-grey-light rounded-full mr-3 flex items-center justify-center group-hover:border-orange transition-colors">
                    <div className="w-2 h-2 bg-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-mblack group-hover:text-orange transition-colors">Yes</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-grey-medium">
            <p className="mb-2">
              Your responses are confidential and used only to ensure your safety.
            </p>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-green hover:text-green-dark transition-colors hover:underline"
                disabled={isSubmitting}
              >
                Skip assessment (not recommended)
              </button>
            )}
          </div>

          {/* Loading State */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green mx-auto mb-2"></div>
                <p className="text-grey-medium">Submitting assessment...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
