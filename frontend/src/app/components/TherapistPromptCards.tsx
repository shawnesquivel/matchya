"use client";
import React from "react";

interface PromptCardProps {
  question: string;
  answer: string;
  category: string;
  categoryDisplay: string;
}

const PromptCard: React.FC<PromptCardProps> = ({ question, answer, category, categoryDisplay }) => {
  return (
    <div className="bg-beige-xxl p-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
      <h3 className="text-lg font-medium mb-2 text-gray-800">{question}</h3>
      <p className="text-gray-600 whitespace-pre-line">{answer}</p>
    </div>
  );
};

export interface TherapistPrompt {
  id: string;
  prompt_id: string;
  question: string;
  answer: string;
  category_name: string;
  category_display_name: string;
}

interface TherapistPromptCardsProps {
  prompts: TherapistPrompt[];
  variant?: "modal" | "profile";
}

export default function TherapistPromptCards({
  prompts,
  variant = "modal",
}: TherapistPromptCardsProps) {
  // If no prompts, show empty state
  if (!prompts || prompts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No prompts answered yet.</p>
      </div>
    );
  }

  // Group prompts by category
  const promptsByCategory = prompts.reduce((acc, prompt) => {
    const categoryName = prompt.category_name || "uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = {
        prompts: [],
        displayName: prompt.category_display_name || "Uncategorized",
      };
    }
    acc[categoryName].prompts.push(prompt);
    return acc;
  }, {} as Record<string, { prompts: TherapistPrompt[]; displayName: string }>);

  // Sort categories (personal, therapeutic, fun)
  const categoryOrder = ["personal", "therapeutic", "fun"];
  const sortedCategories = Object.keys(promptsByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => {
        const { prompts: categoryPrompts, displayName } = promptsByCategory[category];
        return (
          <div key={category} className="space-y-4">
            <h2 className="font-medium text-xl text-gray-800">{displayName}</h2>
            <div
              className={`grid ${
                variant === "modal" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
              } gap-4`}
            >
              {categoryPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  question={prompt.question}
                  answer={prompt.answer}
                  category={prompt.category_name}
                  categoryDisplay={prompt.category_display_name}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
