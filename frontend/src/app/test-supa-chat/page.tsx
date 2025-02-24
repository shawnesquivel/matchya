"use client";

import { usePipeline } from "@/lib/hooks/use-pipeline";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message as VercelMessage } from "ai";
import debounce from "lodash/debounce";

interface ChatMessage {
  id: number;
  chat_id: string;
  message: string;
  source: "USER" | "OPENAI";
  user_id: string | null;
  created_at: string;
}

type DisplayMessage = ChatMessage | VercelMessage;

type TherapistDetails = {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  gender?: string;
  ethnicity?: string[];
  sexuality?: string[];
  faith?: string[];
  initial_price?: string;
  subsequent_price?: string;
  availability?: string;
  languages?: string[];
  areas_of_focus?: string[];
  approaches?: {
    long_term: string[];
    short_term: string[];
  };
  similarity?: number;
  ai_summary?: string;
};

type TherapistFilters = {
  gender: string | null;
  sexuality: string[] | null;
  ethnicity: string[] | null;
  faith: string[] | null;
  max_price_initial: number | null;
  max_price_subsequent: number | null;
  availability: string | null;
  format: string[] | null;
};

type TriggerSource = "CHAT" | "FORM";

export default function ChatPage() {
  // log the .env.local keys
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase environment variables not found");
  }
  const [error, setError] = useState<Error | null>(null);
  const [sendingChat, setSendingChat] = useState<Boolean>(false);
  const supabase = createClientComponentClient();
  const [chatId, setChatId] = useState<string | null>(null);
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);
  const [currentTherapists, setCurrentTherapists] = useState<
    TherapistDetails[]
  >([]);
  const [currentFilters, setCurrentFilters] = useState<TherapistFilters>({
    gender: null,
    sexuality: null,
    ethnicity: null,
    faith: null,
    max_price_initial: null,
    max_price_subsequent: null,
    availability: null,
    format: null,
  });

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/chat-v3`,
    onResponse: (response) => {
      console.debug("[Chat] Response received:", response.status);
      console.debug(
        "[Chat] Response headers:",
        Object.fromEntries(response.headers.entries())
      );
    },
    onFinish: (message) => {
      console.debug("[Chat] Stream finished - Full Response:", {
        content: message.content,
        role: message.role,
        id: message.id,
      });
    },
    onError: (error) => {
      console.error("[Chat] Error:", error, "\nStack:", error.stack);
    },
  });

  const generateEmbedding = usePipeline(
    "feature-extraction",
    "Supabase/gte-small"
  );

  // Initialize chatId after mount
  useEffect(() => {
    const storedChatId = localStorage.getItem("currentChatId");
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      const newId = crypto.randomUUID();
      setChatId(newId);
      localStorage.setItem("currentChatId", newId);
    }
  }, []);

  const isReady = !!generateEmbedding;

  // Update the reset handler
  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    setChatId(newId);
    setDisplayMessages([]);
    messages.length = 0;
    setCurrentTherapists([]);
    // Reset filters
    setCurrentFilters({
      gender: null,
      sexuality: null,
      ethnicity: null,
      faith: null,
      max_price_initial: null,
      max_price_subsequent: null,
      availability: null,
      format: null,
    });
    localStorage.setItem("currentChatId", newId);
  };

  // Update getTherapistMatches function
  const getTherapistMatches = async (
    input: string | null,
    embedding: number[] | null,
    currentFormFilters: TherapistFilters,
    triggerSource: TriggerSource,
    updatedMessages: any
  ) => {
    console.debug("[getTherapistMatches] Called with:", {
      hasInput: !!input,
      hasEmbedding: !!embedding,
      currentFormFilters,
      triggerSource,
    });

    try {
      console.log(
        `sending therapist-matches with ${updatedMessages.length} messages`
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            chatId,
            messages: updatedMessages.map(normalizeMessage),
            embedding,
            currentFormFilters,
            triggerSource,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.debug("[getTherapistMatches] Response:", {
        therapistsCount: data.therapists?.length,
        filters: data.filters,
      });

      return data.therapists;
    } catch (error) {
      console.error("[getTherapistMatches] Error:", error);
      return [];
    }
  };

  // Add debug display for filter changes
  useEffect(() => {
    console.debug("[Filters] Current filters updated:", currentFilters);
  }, [currentFilters]);

  // Add form state
  const [formFilters, setFormFilters] = useState<TherapistFilters>({
    gender: null,
    sexuality: null,
    ethnicity: null,
    faith: null,
    max_price_initial: null,
    max_price_subsequent: null,
    availability: null,
    format: null,
  });

  // Toggle handlers
  const toggleGender = (value: string) => {
    setFormFilters((prev) => ({
      ...prev,
      gender: prev.gender === value ? null : value,
    }));
  };

  // Simplify toggleArrayFilter
  const toggleArrayFilter = (
    key: "sexuality" | "ethnicity" | "faith" | "format",
    value: string
  ) => {
    setFormFilters((prev) => {
      if (!prev[key]) {
        return { ...prev, [key]: [value] };
      }
      if (prev[key]?.includes(value)) {
        const filtered = prev[key]?.filter((v) => v !== value);
        return { ...prev, [key]: filtered.length === 0 ? null : filtered };
      }
      return { ...prev, [key]: [...prev[key]!, value] };
    });
  };

  const handlePriceChange = (
    key: "max_price_initial" | "max_price_subsequent",
    value: string
  ) => {
    setFormFilters((prev) => ({
      ...prev,
      [key]: value ? Number(value) : null,
    }));
  };

  const [requestCount, setRequestCount] = useState(0);
  const lastRequestTime = useRef(Date.now());
  const [lastRequestTimeStr, setLastRequestTimeStr] = useState<string>("");

  // Update the time string when lastRequestTime changes
  useEffect(() => {
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    };
    setLastRequestTimeStr(formatTime(lastRequestTime.current));
  }, [lastRequestTime.current]);

  // Add fetchTherapists function
  const fetchFilteredTherapists = async () => {
    console.log("[Fetch] Starting with filters:", formFilters);
    const now = Date.now();
    lastRequestTime.current = now;

    // Update the formatted time string
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    };
    setLastRequestTimeStr(formatTime(now));

    setRequestCount((prev) => prev + 1);

    const hasActiveFilters = Object.values(formFilters).some((v) => {
      const hasValue = v !== null && (Array.isArray(v) ? v.length > 0 : true);
      return hasValue;
    });

    if (!hasActiveFilters) {
      console.log("No active filters set, skipping fetch");
      setCurrentTherapists([]); // Clear results when no filters
      return;
    }

    let query = supabase.from("therapists").select(`
      id,
      first_name,
      last_name,
      bio,
      gender,
      ethnicity,
      sexuality,
      faith,
      availability,
      languages,
      areas_of_focus,
      approaches,
      ai_summary,
      ${
        formFilters.max_price_initial
          ? "therapist_fees!inner(session_category, session_type, price, currency)"
          : "therapist_fees(session_category, session_type, price, currency)"
      }
    `);

    if (formFilters.gender) {
      query = query.eq("gender", formFilters.gender);
    }

    if (formFilters.ethnicity?.length) {
      query = query.overlaps("ethnicity", formFilters.ethnicity);
    }

    if (formFilters.sexuality?.length) {
      query = query.overlaps("sexuality", formFilters.sexuality);
    }

    if (formFilters.faith?.length) {
      query = query.overlaps("faith", formFilters.faith);
    }

    if (formFilters.availability) {
      query = query.eq("availability", formFilters.availability);
    }

    if (formFilters.max_price_initial) {
      query = query
        .lte("therapist_fees.price", formFilters.max_price_initial)
        .eq("therapist_fees.session_category", "initial");
    }

    const { data: therapists, error } = await query;

    if (error) {
      console.error("[Fetch] Error:", error);
      setError(error);
      setCurrentTherapists([]);
    }

    if (!error && therapists) {
      setCurrentFilters(formFilters);

      const formattedTherapists = therapists.map(
        ({ therapist_fees, ...t }) => ({
          ...t,
          initial_price: therapist_fees?.find(
            (f) => f.session_category === "initial"
          )
            ? `$${
                therapist_fees.find((f) => f.session_category === "initial")
                  ?.price
              } ${
                therapist_fees.find((f) => f.session_category === "initial")
                  ?.currency || "USD"
              }`
            : undefined,
          subsequent_price: therapist_fees?.find(
            (f) => f.session_category === "subsequent"
          )
            ? `$${
                therapist_fees.find((f) => f.session_category === "subsequent")
                  ?.price
              } ${
                therapist_fees.find((f) => f.session_category === "subsequent")
                  ?.currency || "USD"
              }`
            : undefined,
        })
      );

      setCurrentTherapists(formattedTherapists);
    } else {
      console.error("[Fetch] Error:", error);
      setError(error);
      setCurrentTherapists([]);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Remove debouncedFetch and replace with direct fetch
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    console.log("[Filter Change] Update triggered", {
      filters: formFilters,
    });
    fetchFilteredTherapists();
  }, [formFilters]);

  return (
    <div className="flex w-full h-full gap-4">
      {/* Filter Form Panel */}
      <div className="w-80 h-full border-r p-4 overflow-y-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <h2 className="text-lg font-semibold mb-6">Filter Therapists</h2>
        <div className="space-y-2 mb-8">
          <h3>Request Stats</h3>
          <p className="text-sm">
            Total Requests: {requestCount}, Last Request:
            {lastRequestTimeStr || "None"}
          </p>
          <h3>State (Debugging)</h3>
          <p className="text-sm">
            Ethnicity: {formFilters.ethnicity?.join(", ")}, Gender:
            {formFilters.gender}, Faith: {formFilters.faith?.join(", ")}, Max
            Initial Price: {formFilters.max_price_initial}, Max Subsequent
            Price: {formFilters.max_price_subsequent}, Availability:
            {formFilters.availability}, Format: {formFilters.format?.join(", ")}
            , Sexuality: {formFilters.sexuality?.join(", ")}
          </p>
        </div>

        {/* Budget Section */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Your Budget</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                className="w-24 p-2 border rounded-md"
                value={formFilters.max_price_initial || ""}
                onChange={(e) =>
                  handlePriceChange("max_price_initial", e.target.value)
                }
              />
              <span>CAD Initial Visit</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                className="w-24 p-2 border rounded-md"
                value={formFilters.max_price_subsequent || ""}
                onChange={(e) =>
                  handlePriceChange("max_price_subsequent", e.target.value)
                }
              />
              <span>CAD Subsequent Visit</span>
            </div>
          </div>
        </div>

        {/* Gender Section */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Gender</h3>
          <div className="flex flex-wrap gap-2">
            {["male", "female", "non_binary"].map((gender) => (
              <button
                key={gender}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.gender === gender
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleGender(gender)}
              >
                {gender === "non_binary"
                  ? "Non-Binary"
                  : gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Method */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Delivery Method</h3>
          <div className="flex flex-wrap gap-2">
            {["in_person", "online"].map((method) => (
              <button
                key={method}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.availability === method
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() =>
                  setFormFilters((prev) => ({
                    ...prev,
                    availability: prev.availability === method ? null : method,
                  }))
                }
              >
                {method === "in_person" ? "In Person" : "Online"}
              </button>
            ))}
          </div>
        </div>

        {/* Therapy Format */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Therapy Format</h3>
          <div className="flex flex-wrap gap-2">
            {["individual", "couples", "family"].map((format) => (
              <button
                key={format}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.format?.includes(format)
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleArrayFilter("format", format)}
              >
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sexuality */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Sexuality</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "straight",
              "gay",
              "lesbian",
              "bisexual",
              "queer",
              "pansexual",
              "asexual",
              "questioning",
            ].map((sexuality) => (
              <button
                key={sexuality}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.sexuality?.includes(sexuality)
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleArrayFilter("sexuality", sexuality)}
              >
                {sexuality.charAt(0).toUpperCase() + sexuality.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Ethnicity */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Ethnicity</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "asian",
              "black",
              "hispanic",
              "indigenous",
              "middle_eastern",
              "pacific_islander",
              "white",
              "multiracial",
            ].map((ethnicity) => (
              <button
                key={ethnicity}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.ethnicity?.includes(ethnicity)
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleArrayFilter("ethnicity", ethnicity)}
              >
                {ethnicity === "pacific_islander"
                  ? "Pacific Islander"
                  : ethnicity === "middle_eastern"
                  ? "Middle Eastern"
                  : ethnicity.charAt(0).toUpperCase() + ethnicity.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Faith */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Faith</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "christian",
              "jewish",
              "muslim",
              "hindu",
              "buddhist",
              "sikh",
              "atheist",
              "agnostic",
              "spiritual",
              "other",
            ].map((faith) => (
              <button
                key={faith}
                className={`px-4 py-2 rounded-full border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 ${
                  formFilters.faith?.includes(faith)
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
                onClick={() => toggleArrayFilter("faith", faith)}
              >
                {faith.charAt(0).toUpperCase() + faith.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Therapist Details Side Panel */}
      <div className="w-96 h-full border-l p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Matched Therapists</h2>

        {/* Current Filters */}
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">Current Filters</h3>
          <div className="space-y-1 text-sm">
            {currentFilters.gender && (
              <p>
                <span className="font-medium">Gender:</span>
                {currentFilters.gender}
              </p>
            )}
            {currentFilters.ethnicity?.length && (
              <p>
                <span className="font-medium">Ethnicity:</span>
                {currentFilters.ethnicity.join(", ")}
              </p>
            )}
            {currentFilters.sexuality?.length && (
              <p>
                <span className="font-medium">Sexuality:</span>
                {currentFilters.sexuality.join(", ")}
              </p>
            )}
            {currentFilters.faith?.length && (
              <p>
                <span className="font-medium">Faith:</span>
                {currentFilters.faith.join(", ")}
              </p>
            )}
            {currentFilters.max_price_initial && (
              <p>
                <span className="font-medium">Max Initial Price:</span> $
                {currentFilters.max_price_initial}
              </p>
            )}
            {currentFilters.max_price_subsequent && (
              <p>
                <span className="font-medium">Max Subsequent Price:</span> $
                {currentFilters.max_price_subsequent}
              </p>
            )}
            {currentFilters.availability && (
              <p>
                <span className="font-medium">Availability:</span>
                {currentFilters.availability}
              </p>
            )}
          </div>
        </div>

        {/* Existing Therapist List */}
        {currentTherapists.length > 0 ? (
          currentTherapists.map((t) => (
            <div key={t.id} className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium text-lg">
                {t.first_name} {t.last_name}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                {t.similarity !== undefined && (
                  <p>
                    <span className="font-medium">Match:</span>
                    {(t.similarity * 100).toFixed(1)}%
                  </p>
                )}
                {t.gender && (
                  <p>
                    <span className="font-medium">Gender:</span> {t.gender}
                  </p>
                )}
                {t.ethnicity && (
                  <p>
                    <span className="font-medium">Ethnicity:</span>
                    {t.ethnicity}
                  </p>
                )}
                {t.faith && (
                  <p>
                    <span className="font-medium">Faith:</span> {t.faith}
                  </p>
                )}
                {t.initial_price && (
                  <p>
                    <span className="font-medium">Initial Session:</span>
                    {t.initial_price}
                  </p>
                )}
                {t.subsequent_price && (
                  <p>
                    <span className="font-medium">Ongoing Sessions:</span>
                    {t.subsequent_price}
                  </p>
                )}
                {t.availability && (
                  <p>
                    <span className="font-medium">Availability:</span>
                    {t.availability}
                  </p>
                )}
                {t.languages?.length && (
                  <p>
                    <span className="font-medium">Languages:</span>
                    {t.languages.join(", ")}
                  </p>
                )}
                {t.areas_of_focus?.length && (
                  <div className="mt-2">
                    <p className="font-medium">Focus Areas:</p>
                    <ul className="list-disc list-inside">
                      {t.areas_of_focus.slice(0, 3).map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.approaches?.long_term?.length && (
                  <div className="mt-2">
                    <p className="font-medium">Approaches:</p>
                    <ul className="list-disc list-inside">
                      {t.approaches.long_term.slice(0, 3).map((approach, i) => (
                        <li key={i}>{approach}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.ai_summary && <p className="mt-2 italic">{t.ai_summary}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No therapists matched yet</p>
        )}
      </div>
      <div className="max-w-6xl flex flex-col items-center w-full h-full">
        {/* Chat ID Controls */}
        <div className="w-full mb-4 p-4 border rounded-sm flex gap-2 items-center">
          <span className="text-sm text-gray-500">Chat ID: {chatId}</span>
          <button onClick={handleNewChat}>New Chat</button>
        </div>

        {/* Debug Info */}
        <div className="w-full mb-4 p-4 border rounded-sm">
          <h1 className="cursor-pointer">Debug Info</h1>
          <div className="mt-2 text-sm font-mono">
            <div>Message Length: {messages.length}</div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col w-full gap-6 grow my-2 sm:my-10 p-4 sm:p-8 sm:border rounded-sm">
          {/* Messages Area */}
          <div className="border-slate-400 rounded-lg flex flex-col justify-start gap-4 pr-2 grow overflow-y-scroll">
            {(displayMessages as DisplayMessage[])
              .concat(messages as DisplayMessage[])
              .map((msg) => {
                const role =
                  "role" in msg ? msg.role : msg.source.toLowerCase();
                const content = "content" in msg ? msg.content : msg.message;
                const messageId =
                  "id" in msg && msg.id ? msg.id : crypto.randomUUID();

                return (
                  <div
                    key={messageId}
                    className={`rounded-xl bg-gray-500 text-white px-4 py-2 max-w-lg ${
                      role === "user" ? "self-end bg-blue-600" : "self-start"
                    }`}
                  >
                    {String(content)}
                  </div>
                );
              })}
            {status === "streaming" && (
              <div className="self-start m-6 text-gray-500 before:text-gray-500 after:text-gray-500 dot-pulse" />
            )}
            {messages.length === 0 && (
              <div className="self-stretch flex grow items-center justify-center">
                <svg
                  className="opacity-10"
                  width="150px"
                  height="150px"
                  version="1.1"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path d="m77.082 39.582h-29.164c-3.543 0-6.25 2.707-6.25 6.25v16.668c0 3.332 2.707 6.25 6.25 6.25h20.832l8.332 8.332v-8.332c3.543 0 6.25-2.918 6.25-6.25v-16.668c0-3.5391-2.707-6.25-6.25-6.25z" />
                    <path d="m52.082 25h-29.164c-3.543 0-6.25 2.707-6.25 6.25v16.668c0 3.332 2.707 6.25 6.25 6.25v8.332l8.332-8.332h6.25v-8.332c0-5.832 4.582-10.418 10.418-10.418h10.418v-4.168c-0.003907-3.543-2.7109-6.25-6.2539-6.25z" />
                  </g>
                </svg>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form
            className="flex items-center space-x-2 gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setSendingChat(true);
              try {
                if (!generateEmbedding) {
                  throw new Error("Unable to generate embeddings");
                }
                const newMessage = {
                  role: "user" as const,
                  content: input,
                  id: crypto.randomUUID(),
                  createdAt: new Date(),
                };
                const updatedMessages = [...messages, newMessage];

                const rawEmbedding = await generateEmbedding(input, {
                  pooling: "mean",
                  normalize: true,
                });
                const embedding = Array.from(rawEmbedding.data) as number[];

                const matchedTherapists = await getTherapistMatches(
                  input,
                  embedding,
                  formFilters,
                  "CHAT",
                  updatedMessages
                );

                setCurrentTherapists(matchedTherapists.slice(0, 3));

                const responseBody = {
                  chatId,
                  messages: updatedMessages.map(normalizeMessage),
                  matchedTherapists,
                };

                handleSubmit(e, {
                  body: responseBody,
                });
              } catch (error) {
                setError(error.toString());
              } finally {
                setSendingChat(false);
              }
            }}
          >
            <input
              type="text"
              autoFocus
              placeholder="Send a message"
              value={input}
              onChange={handleInputChange}
            />
            <button type="submit" disabled={!isReady}>
              Send
            </button>
          </form>
          <p
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in asian backgrounds.
          </p>
          <p
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in black backgrounds.
          </p>
          <p
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in white backgrounds.
          </p>
        </div>
      </div>
    </div>
  );
}

const normalizeMessage = (msg: any) => ({
  role: msg.role,
  content: msg.content || (msg.parts?.[0]?.text ?? null),
});
