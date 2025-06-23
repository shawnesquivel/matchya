"use client";
import React from "react";
import Image from "next/image";

// Mock data for therapy sessions with mood analysis
const mockSessionData = [
  { session: 1, mood: "down", sentiment: 0.2, date: "2024-01-15" },
  { session: 2, mood: "neutral", sentiment: 0.3, date: "2024-01-22" },
  { session: 3, mood: "down", sentiment: 0.15, date: "2024-01-29" },
  { session: 4, mood: "neutral", sentiment: 0.45, date: "2024-02-05" },
  { session: 5, mood: "up", sentiment: 0.5, date: "2024-02-12" },
  { session: 6, mood: "up", sentiment: 0.6, date: "2024-02-19" },
  { session: 7, mood: "up", sentiment: 0.7, date: "2024-02-26" },
  { session: 8, mood: "up", sentiment: 0.65, date: "2024-03-05" },
];

// Mock cognitive distortion data
const mockDistortionData = [
  { type: "Catastrophizing", count: 8, color: "#ef4444" },
  { type: "All-or-Nothing", count: 6, color: "#f97316" },
  { type: "Mind Reading", count: 4, color: "#eab308" },
  { type: "Should Statements", count: 3, color: "#22c55e" },
  { type: "Overgeneralization", count: 2, color: "#3b82f6" },
];

// Mock heatmap data (daily mood for past 30 days)
const generateHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const mood = Math.random() > 0.3 ? (Math.random() > 0.5 ? "up" : "neutral") : "down";
    data.push({
      date: date.toISOString().split("T")[0],
      mood,
      intensity: Math.random() * 0.8 + 0.2,
    });
  }
  return data;
};

const mockHeatmapData = generateHeatmapData();

// AI Summary Component
function AIProgressSummary() {
  const recentMoods = mockSessionData.slice(-4).map((s) => s.mood);
  const upCount = recentMoods.filter((m) => m === "up").length;
  const neutralCount = recentMoods.filter((m) => m === "neutral").length;
  const downCount = recentMoods.filter((m) => m === "down").length;

  return (
    <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-mblack mb-3">Your Progress Insights</h2>
      <div className="prose text-grey-medium">
        <p className="text-base leading-relaxed">
          <strong className="text-mblack">Great progress this month!</strong> Your recent sessions
          show {upCount} positive sessions, {neutralCount} neutral, and {downCount} challenging
          ones.
          {upCount >= 3
            ? " You're building strong momentum with consistently positive emotional patterns."
            : upCount >= 2
            ? " You're showing steady improvement with more positive sessions than negative ones."
            : " While some sessions have been challenging, you're showing resilience by continuing your therapy journey."}
        </p>
        <p className="text-sm mt-2">
          Your cognitive distortion patterns show{" "}
          <strong className="text-mblack">catastrophizing</strong> as your main area to work on,
          while you've made significant progress reducing{" "}
          <strong className="text-mblack">overgeneralization</strong> thoughts. Keep practicing the
          mindfulness techniques we discussed!
        </p>
      </div>
    </div>
  );
}

// Mood trend line component
function MoodTrendLine() {
  const width = 400;
  const height = 200;
  const padding = 40;

  // Convert mood to numeric values for plotting
  const moodToValue = (mood: string) => {
    switch (mood) {
      case "up":
        return 1;
      case "neutral":
        return 0.5;
      case "down":
        return 0;
      default:
        return 0.5;
    }
  };

  const moodValues = mockSessionData.map((d) => moodToValue(d.mood));
  const maxValue = 1;
  const minValue = 0;

  // Calculate points for the line
  const points = mockSessionData
    .map((d, i) => {
      const x = padding + (i * (width - 2 * padding)) / (mockSessionData.length - 1);
      const y =
        padding +
        ((maxValue - moodToValue(d.mood)) / (maxValue - minValue)) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

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
        return "#22c55e";
      case "neutral":
        return "#eab308";
      case "down":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm">
      <h3 className="text-lg font-medium text-mblack mb-4">Mood Progress Over Sessions</h3>
      <p className="text-sm text-grey-medium mb-4">
        Track your emotional state during therapy sessions. Recent sessions show positive momentum!
      </p>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((value) => {
            const y =
              padding + ((maxValue - value) / (maxValue - minValue)) * (height - 2 * padding);
            return (
              <g key={value}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text x={padding - 10} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end">
                  {value === 1 ? "😊" : value === 0.5 ? "😐" : "😔"}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {mockSessionData.map((d, i) => {
            const x = padding + (i * (width - 2 * padding)) / (mockSessionData.length - 1);
            return (
              <text
                key={i}
                x={x}
                y={height - padding + 20}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                S{d.session}
              </text>
            );
          })}

          {/* Trend line */}
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {mockSessionData.map((d, i) => {
            const x = padding + (i * (width - 2 * padding)) / (mockSessionData.length - 1);
            const y =
              padding +
              ((maxValue - moodToValue(d.mood)) / (maxValue - minValue)) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={6}
                fill={getMoodColor(d.mood)}
                stroke="white"
                strokeWidth={2}
                className="hover:r-8 transition-all cursor-pointer"
              >
                <title>{`Session ${d.session}: ${d.mood} mood`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 text-sm text-grey-medium">
        <p>
          <strong className="text-mblack">Latest session:</strong>{" "}
          {getMoodIcon(mockSessionData[mockSessionData.length - 1].mood)}{" "}
          {mockSessionData[mockSessionData.length - 1].mood} mood
        </p>
        <p>
          <strong className="text-mblack">Recent trend:</strong> More positive sessions in your last
          4 visits
        </p>
      </div>
    </div>
  );
}

// Cognitive Distortion Bar Chart
function CognitiveDistortionChart() {
  const maxCount = Math.max(...mockDistortionData.map((d) => d.count));

  return (
    <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm">
      <h3 className="text-lg font-medium text-mblack mb-4">Cognitive Distortion Patterns</h3>
      <p className="text-sm text-grey-medium mb-4">
        Frequency of different thought patterns identified in your recent sessions.
      </p>

      <div className="space-y-3">
        {mockDistortionData.map((distortion, i) => (
          <div key={distortion.type} className="flex items-center">
            <div className="w-32 text-sm text-mblack font-medium truncate">{distortion.type}</div>
            <div className="flex-1 mx-3">
              <div className="w-full bg-beige-light rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{
                    width: `${(distortion.count / maxCount) * 100}%`,
                    backgroundColor: distortion.color,
                  }}
                >
                  <span className="text-white text-xs font-bold">{distortion.count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-grey-medium">
        <p>
          <strong className="text-mblack">Focus area:</strong> Catastrophizing thoughts - practicing
          grounding techniques
        </p>
      </div>
    </div>
  );
}

// Spider/Radar Chart Component
function TherapyRadarChart() {
  const metrics = [
    { name: "Mood", value: 0.75, max: 1 },
    { name: "Coping", value: 0.6, max: 1 },
    { name: "Stress", value: 0.3, max: 1 }, // Lower is better
    { name: "Sleep", value: 0.7, max: 1 },
    { name: "Social", value: 0.8, max: 1 },
    { name: "Focus", value: 0.65, max: 1 },
  ];

  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (2 * Math.PI) / metrics.length;

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = value * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  const points = metrics.map((metric, i) => getPoint(metric.value, i));
  const pathData = `M${points.map((p) => `${p.x},${p.y}`).join("L")}Z`;

  return (
    <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm">
      <h3 className="text-lg font-medium text-mblack mb-4">Wellness Overview</h3>
      <p className="text-sm text-grey-medium mb-4">
        Multi-dimensional view of your current emotional and mental wellness.
      </p>

      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {metrics.map((_, i) => {
            const endPoint = getPoint(1, i);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
            );
          })}

          {/* Data area */}
          <path d={pathData} fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth={2} />

          {/* Data points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill="#22c55e"
              stroke="white"
              strokeWidth={2}
            />
          ))}

          {/* Labels */}
          {metrics.map((metric, i) => {
            const labelPoint = getPoint(1.2, i);
            return (
              <text
                key={i}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="12"
                fill="#374151"
                className="font-medium"
              >
                {metric.name}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 text-sm text-grey-medium">
        <p>
          <strong className="text-mblack">Strongest areas:</strong> Social connections and mood
          stability
        </p>
      </div>
    </div>
  );
}

// Mood Heatmap Calendar
function MoodHeatmap() {
  const getMoodColor = (mood: string, intensity: number) => {
    const alpha = intensity;
    switch (mood) {
      case "up":
        return `rgba(34, 197, 94, ${alpha})`;
      case "neutral":
        return `rgba(234, 179, 8, ${alpha})`;
      case "down":
        return `rgba(239, 68, 68, ${alpha})`;
      default:
        return `rgba(156, 163, 175, ${alpha})`;
    }
  };

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < mockHeatmapData.length; i += 7) {
    weeks.push(mockHeatmapData.slice(i, i + 7));
  }

  return (
    <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm">
      <h3 className="text-lg font-medium text-mblack mb-4">Daily Mood Calendar</h3>
      <p className="text-sm text-grey-medium mb-4">
        Your mood patterns over the past 30 days. Green = positive, Yellow = neutral, Red =
        challenging.
      </p>

      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="w-6 h-6 rounded border border-grey-light"
                style={{ backgroundColor: getMoodColor(day.mood, day.intensity) }}
                title={`${day.date}: ${day.mood} mood`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-grey-medium">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.7)" }}
          ></div>
          <span>Challenging</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgba(234, 179, 8, 0.7)" }}
          ></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.7)" }}
          ></div>
          <span>Positive</span>
        </div>
      </div>
    </div>
  );
}

// Session summary cards
function SessionSummary() {
  const totalSessions = mockSessionData.length;
  const upSessions = mockSessionData.filter((s) => s.mood === "up").length;
  const recentTrend = mockSessionData.slice(-3).filter((s) => s.mood === "up").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white-dark rounded-xl border-grey-light border p-4 shadow-sm">
        <div className="text-2xl font-bold text-blue-light">{totalSessions}</div>
        <div className="text-sm text-grey-medium">Total Sessions</div>
      </div>

      <div className="bg-white-dark rounded-xl border-grey-light border p-4 shadow-sm">
        <div className="text-2xl font-bold text-green">{upSessions}/8</div>
        <div className="text-sm text-grey-medium">Positive Sessions</div>
      </div>

      <div className="bg-white-dark rounded-xl border-grey-light border p-4 shadow-sm">
        <div className="text-2xl font-bold text-green">{recentTrend}/3</div>
        <div className="text-sm text-grey-medium">Recent Positive Trend</div>
      </div>
    </div>
  );
}

interface DashboardProps {
  onBackToChat: () => void;
}

export default function Dashboard({ onBackToChat }: DashboardProps) {
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

  return (
    <div className="h-full bg-beige overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-mblack mb-2">Your Progress Dashboard</h1>
          <p className="text-grey-medium">
            Track your therapy journey with data-driven insights from your session conversations.
          </p>
        </div>

        <AIProgressSummary />
        <SessionSummary />

        {/* Main charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MoodTrendLine />
          <CognitiveDistortionChart />
        </div>

        {/* Secondary charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TherapyRadarChart />
          <MoodHeatmap />
        </div>

        {/* Recent sessions */}
        <div className="bg-white-dark rounded-xl border-grey-light border p-6 shadow-sm">
          <h3 className="text-lg font-medium text-mblack mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {mockSessionData
              .slice(-4)
              .reverse()
              .map((session, index) => (
                <div
                  key={session.session}
                  className="flex items-center justify-between py-2 border-b border-beige-light last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-mblack">Session {session.session}</div>
                    <div className="text-sm text-grey-medium">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-medium ${getMoodColor(
                        session.mood
                      )} flex items-center gap-1`}
                    >
                      <span>{getMoodIcon(session.mood)}</span>
                      <span className="capitalize">{session.mood}</span>
                    </div>
                    <div className="text-sm text-grey-medium">mood</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
