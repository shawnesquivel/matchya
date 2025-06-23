"use client";
import React, { useState } from "react";

// Mock conversation data
const mockConversations = [
  {
    id: "1",
    title: "CBT Session - Anxiety Management",
    date: "2024-03-05",
    time: "2:30 PM",
    therapyType: "CBT",
    mood: "up",
    preview: "We discussed coping strategies for work stress...",
    isActive: true,
  },
  {
    id: "2",
    title: "DBT Session - Emotional Regulation",
    date: "2024-02-26",
    time: "11:15 AM",
    therapyType: "DBT",
    mood: "neutral",
    preview: "Practiced mindfulness techniques and explored...",
    isActive: false,
  },
  {
    id: "3",
    title: "CBT Session - Cognitive Restructuring",
    date: "2024-02-19",
    time: "3:45 PM",
    therapyType: "CBT",
    mood: "down",
    preview: "Identified negative thought patterns and...",
    isActive: false,
  },
  {
    id: "4",
    title: "EMDR Session - Trauma Processing",
    date: "2024-02-12",
    time: "1:00 PM",
    therapyType: "EMDR",
    mood: "up",
    preview: "Worked through difficult memories using...",
    isActive: false,
  },
  {
    id: "5",
    title: "CBT Session - Depression Check-in",
    date: "2024-02-05",
    time: "10:30 AM",
    therapyType: "CBT",
    mood: "neutral",
    preview: "Reviewed progress and adjusted treatment...",
    isActive: false,
  },
  {
    id: "6",
    title: "DBT Session - Distress Tolerance",
    date: "2024-01-29",
    time: "4:15 PM",
    therapyType: "DBT",
    mood: "down",
    preview: "Learned new skills for managing crisis...",
    isActive: false,
  },
];

interface ConversationPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function ConversationPanel({ isVisible, onToggle }: ConversationPanelProps) {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0].id);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "up":
        return "😊";
      case "neutral":
        return "😐";
      case "down":
        return "😔";
      default:
        return "😐";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "up":
        return "text-green";
      case "neutral":
        return "text-orange";
      case "down":
        return "text-red-600";
      default:
        return "text-grey-medium";
    }
  };

  const getTherapyTypeColor = (type: string) => {
    switch (type) {
      case "CBT":
        return "bg-blue-light text-white";
      case "DBT":
        return "bg-green text-white";
      case "EMDR":
        return "bg-purple-500 text-white";
      default:
        return "bg-grey-medium text-white";
    }
  };

  return (
    <div
      className={`bg-white-dark border-r border-grey-light transition-all duration-300 ${
        isVisible ? "w-80" : "w-0"
      } overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-grey-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-mblack">Conversation History</h2>
          <button
            onClick={onToggle}
            className="text-grey-medium hover:text-mblack transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-grey-medium mt-1">Your recent therapy sessions</p>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-grey-light">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 text-sm border border-grey-light rounded-lg bg-beige-light text-mblack placeholder-grey-medium focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 w-4 h-4 text-grey-medium"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedConversation === conversation.id
                  ? "bg-green-50 border border-green"
                  : "hover:bg-beige-light"
              }`}
            >
              {/* Conversation Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getTherapyTypeColor(
                      conversation.therapyType
                    )}`}
                  >
                    {conversation.therapyType}
                  </span>
                  <span className={`text-lg ${getMoodColor(conversation.mood)}`}>
                    {getMoodIcon(conversation.mood)}
                  </span>
                </div>
                {conversation.isActive && <div className="w-2 h-2 bg-green rounded-full"></div>}
              </div>

              {/* Conversation Title */}
              <h3 className="font-medium text-mblack text-sm mb-1 line-clamp-1">
                {conversation.title}
              </h3>

              {/* Preview */}
              <p className="text-xs text-grey-medium mb-2 line-clamp-2">{conversation.preview}</p>

              {/* Date and Time */}
              <div className="flex items-center justify-between text-xs text-grey-medium">
                <span>{conversation.date}</span>
                <span>{conversation.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-grey-light">
        <button className="w-full bg-green text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-dark transition-colors">
          Start New Session
        </button>
      </div>
    </div>
  );
}
