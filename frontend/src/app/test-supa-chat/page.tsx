"use client";

import { usePipeline } from "@/lib/hooks/use-pipeline";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useChat } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message as VercelMessage } from "ai";

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
  ethnicity?: string;
  gender?: string;
  sexuality?: string;
  faith?: string;
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

export default function ChatPage() {
  // log the .env.local keys
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase environment variables not found");
  }

  const supabase = createClientComponentClient();
  const [chatId, setChatId] = useState<string | null>(null);
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);
  const [currentTherapists, setCurrentTherapists] = useState<
    TherapistDetails[]
  >([]);
  const [promptTemplate, setPromptTemplate] =
    useState(`You're an AI assistant helping people find the right therapist.

Keep your responses warm and empathetic, but concise:

When suggesting therapists:
1. Acknowledge the preferences or needs they've shared
2. Briefly introduce each matching therapist (max 3 details per therapist)
3. Explain why you think they might be a good fit

If no therapists match their criteria:
- Acknowledge their preferences
- Suggest broadening specific criteria
- Offer to try a different search

If they're asking general questions:
- Answer directly and briefly
- Relate it back to finding a therapist if relevant
- Encourage them to share their preferences

Remember:
- Focus on making meaningful matches, not just listing all options
- Be sensitive to cultural, identity, and accessibility needs
- Maintain professional boundaries while being approachable`);

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
    localStorage.setItem("currentChatId", newId);
  };

  // New function to get therapist matches
  const getTherapistMatches = async (input: string, embedding: number[]) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/therapist-matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            message: input,
            chatId,
            messages: messages,
            embedding,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const therapists = await response.json();
      console.debug("[Therapist Matches] Response:", therapists);
      return therapists;
    } catch (error) {
      console.error("[Therapist Matches] Error:", error);
      return [];
    }
  };

  return (
    <div className="flex w-full h-full gap-4">
      {/* Therapist Details Side Panel */}
      <div className="w-96 h-full border-l p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Matched Therapists</h2>
        {currentTherapists.length > 0 ? (
          currentTherapists.map((t) => (
            <div key={t.id} className="mb-6 p-4 border rounded-lg">
              <h3 className="font-medium text-lg">
                {t.first_name} {t.last_name}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                {t.similarity !== undefined && (
                  <p>
                    <span className="font-medium">Match:</span>{" "}
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
                    <span className="font-medium">Ethnicity:</span>{" "}
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
                    <span className="font-medium">Initial Session:</span>{" "}
                    {t.initial_price}
                  </p>
                )}
                {t.subsequent_price && (
                  <p>
                    <span className="font-medium">Ongoing Sessions:</span>{" "}
                    {t.subsequent_price}
                  </p>
                )}
                {t.availability && (
                  <p>
                    <span className="font-medium">Availability:</span>{" "}
                    {t.availability}
                  </p>
                )}
                {t.languages?.length && (
                  <p>
                    <span className="font-medium">Languages:</span>{" "}
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
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 text-sm font-mono">
              <div>First Message: {messages.length === 0 ? "Yes" : "No"}</div>
              <div className="mt-2">
                <div>Current Matched Therapists:</div>
                {currentTherapists.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {currentTherapists.map((t) => (
                      <li key={t.id}>
                        {t.first_name} {t.last_name} (ID: {t.id})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic">
                    No therapists matched yet
                  </div>
                )}
              </div>
            </div>
          </details>
        </div>

        {/* System Prompt Editor */}
        <details className="w-full mb-4 p-4 border rounded-sm">
          <summary className="cursor-pointer">System Prompt</summary>
          <textarea
            className="w-full mt-2 p-2 border rounded-sm font-mono text-sm"
            rows={8}
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
          />
        </details>

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

          {/* Input Form */}
          <form
            className="flex items-center space-x-2 gap-2"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!generateEmbedding) {
                throw new Error("Unable to generate embeddings");
              }

              const embedStart = performance.now();
              console.debug(
                "[Timing] Starting client-side embedding generation"
              );

              //  set to the same embeddings config as the server
              const output = await generateEmbedding(input, {
                pooling: "mean",
                normalize: true,
              });

              console.debug(
                "[Timing] Client-side embedding completed in",
                performance.now() - embedStart,
                "ms"
              );

              const embedding = Array.from(output.data) as number[];
              console.debug("[Timing] Embedding length:", embedding.length);

              // First get therapist matches and update UI
              const matchedTherapists = await getTherapistMatches(
                input,
                embedding
              );
              setCurrentTherapists(matchedTherapists.slice(0, 3));

              // Then send chat request with the same matched therapists
              const responseBody = {
                chatId,
                message: input,
                messages: messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                matchedTherapists,
                promptTemplate,
              };
              console.log("sending chat request", responseBody);

              handleSubmit(e, {
                body: responseBody,
              });
            }}
          >
            <input
              type="text"
              autoFocus
              placeholder="Send a message"
              value={input}
              onChange={handleInputChange}
            />{" "}
            <button type="submit" disabled={!isReady}>
              Send
            </button>
          </form>
          <p
            contentEditable="true"
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in asian backgrounds.{" "}
          </p>
          <p
            contentEditable="true"
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in black backgrounds.{" "}
          </p>
          <p
            contentEditable="true"
            style={{
              border: "1px dashed #ccc",
              padding: "8px",
              cursor: "text",
            }}
          >
            Looking for a therapist with experience in white backgrounds.{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
