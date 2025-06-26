"use client";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import VoiceTranscript from "./components/VoiceTranscript";
import VoiceEvents from "./components/VoiceEvents";
import VoiceToolbar from "./components/VoiceToolbar";
import { SessionStatus } from "./types";
import { useVoiceTranscript } from "./contexts/VoiceTranscriptContext";
import { useVoiceEvent } from "./contexts/VoiceEventContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import { createModerationGuardrail } from "./agentConfigs/guardrails";
import { therapyAgentScenario } from "./agentConfigs/therapyAgent";
import useAudioDownload from "./hooks/useAudioDownload";
import { useHandleSessionHistory } from "./hooks/useHandleSessionHistory";
import { useLotus } from "../LotusContext";

export default function VoiceTherapyApp() {
  console.log("[VoiceTherapyApp] Component mounting");

  const router = useRouter();
  const { setVoiceMode } = useLotus();
  const [hasShownError, setHasShownError] = useState(false);

  // Hardcode therapy agent scenario
  const agentSetKey = "therapyAgent";
  const agentConfigSet = therapyAgentScenario;
  const selectedAgentName = agentConfigSet[0]?.name || "";

  console.log("[VoiceTherapyApp] Agent config loaded:", {
    agentSetKey,
    selectedAgentName,
    agentCount: agentConfigSet.length,
  });

  const { addTranscriptMessage, addTranscriptBreadcrumb } = useVoiceTranscript();
  const { logClientEvent, logServerEvent } = useVoiceEvent();

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const handoffTriggeredRef = useRef(false);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const el = document.createElement("audio");
    el.autoplay = true;
    el.style.display = "none";
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const { connect, disconnect, sendUserText, sendEvent, interrupt, mute } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    onAgentHandoff: (agentName: string) => {
      handoffTriggeredRef.current = true;
      // No agent switching UI, so ignore
    },
  });

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState<boolean>(false);
  const [userText, setUserText] = useState<string>("");
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("audioPlaybackEnabled");
    return stored ? stored === "true" : true;
  });

  const { startRecording, stopRecording, downloadRecording } = useAudioDownload();
  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error("Failed to send via SDK", err);
    }
  };

  useHandleSessionHistory();

  // No agent selection, always use therapy agent
  // No codec selection, always use opus

  const fetchEphemeralKey = async (): Promise<string | null> => {
    console.log("[VoiceTherapyApp] fetchEphemeralKey: Starting request");
    logClientEvent({ url: "/api/voice-session" }, "fetch_session_token_request");

    try {
      console.log(
        "[VoiceTherapyApp] fetchEphemeralKey: Making fetch request to /api/voice-session"
      );
      const tokenResponse = await fetch("/api/voice-session", { method: "POST" });

      console.log("[VoiceTherapyApp] fetchEphemeralKey: Response status:", tokenResponse.status);
      console.log(
        "[VoiceTherapyApp] fetchEphemeralKey: Response headers:",
        Object.fromEntries(tokenResponse.headers.entries())
      );

      const data = await tokenResponse.json();
      console.log(
        "[VoiceTherapyApp] fetchEphemeralKey: Response data:",
        JSON.stringify(data, null, 2)
      );

      logServerEvent(data, "fetch_session_token_response");

      if (!data.client_secret?.value) {
        console.error("[VoiceTherapyApp] fetchEphemeralKey: No client_secret.value in response");
        logClientEvent(data, "error.no_ephemeral_key");
        console.error("No ephemeral key provided by the server");
        setSessionStatus("DISCONNECTED");
        setHasShownError(true);
        return null;
      }

      console.log("[VoiceTherapyApp] fetchEphemeralKey: Successfully got ephemeral key");
      return data.client_secret.value;
    } catch (error) {
      console.error("[VoiceTherapyApp] fetchEphemeralKey: Fetch error:", error);
      logClientEvent(
        { error: error instanceof Error ? error.message : "Unknown error" },
        "error.fetch_failed"
      );
      setSessionStatus("DISCONNECTED");
      setHasShownError(true);
      return null;
    }
  };

  const connectToRealtime = async () => {
    console.log("[VoiceTherapyApp] connectToRealtime: Starting connection attempt");
    console.log("[VoiceTherapyApp] connectToRealtime: Current session status:", sessionStatus);

    if (sessionStatus !== "DISCONNECTED") {
      console.log("[VoiceTherapyApp] connectToRealtime: Already connected or connecting, skipping");
      return;
    }

    setSessionStatus("CONNECTING");
    setHasShownError(false);
    console.log("[VoiceTherapyApp] connectToRealtime: Set status to CONNECTING");

    try {
      console.log("[VoiceTherapyApp] connectToRealtime: Fetching ephemeral key");
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) {
        console.log("[VoiceTherapyApp] connectToRealtime: No ephemeral key received, aborting");
        return;
      }

      console.log("[VoiceTherapyApp] connectToRealtime: Got ephemeral key, preparing agents");
      const reorderedAgents = [...agentConfigSet];
      console.log(
        "[VoiceTherapyApp] connectToRealtime: Agent config:",
        JSON.stringify(reorderedAgents, null, 2)
      );

      // No agent switching, so just use the first agent

      const guardrail = createModerationGuardrail("therapy");
      console.log("[VoiceTherapyApp] connectToRealtime: Created guardrail");

      console.log("[VoiceTherapyApp] connectToRealtime: Calling connect with SDK");
      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: reorderedAgents,
        audioElement: sdkAudioElement,
        outputGuardrails: [guardrail],
        extraContext: {
          addTranscriptBreadcrumb,
        },
      });
      console.log("[VoiceTherapyApp] connectToRealtime: SDK connect completed successfully");
    } catch (err) {
      console.error("[VoiceTherapyApp] connectToRealtime: Error connecting via SDK:", err);
      setSessionStatus("DISCONNECTED");
      setHasShownError(true);
    }
    return;
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  };

  const handleBackToChatDemo = () => {
    console.log("[VoiceTherapyApp] handleBackToChatDemo: Attempting navigation");
    console.log("[VoiceTherapyApp] handleBackToChatDemo: Router object:", router);

    try {
      // Reset voice mode first
      console.log("[VoiceTherapyApp] handleBackToChatDemo: Resetting voice mode");
      setVoiceMode(false);

      // First try the router
      router.push("/chat-demo");
      console.log("[VoiceTherapyApp] handleBackToChatDemo: Router.push called");
    } catch (error) {
      console.error("[VoiceTherapyApp] handleBackToChatDemo: Router error:", error);
      // Fallback to window.location
      console.log("[VoiceTherapyApp] handleBackToChatDemo: Falling back to window.location");
      window.location.href = "/chat-demo";
    }
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent({
      type: "conversation.item.create",
      item: {
        id,
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    });
    sendClientEvent({ type: "response.create" }, "(simulated user text message)");
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    const turnDetection = isPTTActive
      ? null
      : {
          type: "server_vad",
          threshold: 0.9,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true,
        };

    sendEvent({
      type: "session.update",
      session: {
        turn_detection: turnDetection,
      },
    });

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
    return;
  };

  // Add a function to send a message to the voice supervisor API
  const sendVoiceSupervisorMessage = async (userMessage: string) => {
    try {
      // Gather the current stage and transcript
      // We'll assume the transcriptItems are in the same order as the conversation
      // and filter for user/assistant messages only
      const transcriptItems = useVoiceTranscript().transcriptItems;
      const messages = transcriptItems
        .filter((item) => item.role === "user" || item.role === "assistant")
        .map((item) => ({ role: item.role, content: item.data?.text || item.title || "" }));
      // Find the current stage (default to 1 if not tracked elsewhere)
      let currentStage = 1;
      // Optionally, you could track stage in context or state if needed
      // For now, just use 1
      const body = {
        mode: "voice",
        stage: currentStage,
        messages,
        userMessage,
      };
      const res = await fetch("/api/voice-supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Voice supervisor API error");
      const data = await res.json();
      // Add the bot's reply to the transcript
      if (data.botMessage) {
        addTranscriptMessage(data.messageId || uuidv4(), "assistant", data.botMessage);
      }
      // Optionally, update stage or sessionComplete here if you want to track it
    } catch (err) {
      console.error("Voice supervisor error:", err);
    }
  };

  // Replace sendUserText in handleSendTextMessage with sendVoiceSupervisorMessage
  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();
    sendVoiceSupervisorMessage(userText.trim());
    setUserText("");
  };

  const handleTalkButtonDown = () => {
    if (sessionStatus !== "CONNECTED") return;
    interrupt();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" }, "clear PTT buffer");
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== "CONNECTED" || !isPTTUserSpeaking) return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" }, "commit PTT");
    sendClientEvent({ type: "response.create" }, "trigger response PTT");
  };

  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  useEffect(() => {
    console.log("[VoiceTherapyApp] useEffect: Auto-connection check");
    console.log("[VoiceTherapyApp] useEffect: sessionStatus:", sessionStatus);
    console.log("[VoiceTherapyApp] useEffect: hasShownError:", hasShownError);

    if (sessionStatus === "DISCONNECTED" && !hasShownError) {
      console.log("[VoiceTherapyApp] useEffect: Triggering auto-connection");
      connectToRealtime();
    } else {
      console.log("[VoiceTherapyApp] useEffect: Skipping auto-connection");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
  }, [isPTTActive]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      try {
        mute(!isAudioPlaybackEnabled);
      } catch (err) {
        console.warn("mute sync after connect failed", err);
      }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }
    try {
      mute(!isAudioPlaybackEnabled);
    } catch (err) {
      console.warn("Failed to toggle SDK mute", err);
    }
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && audioElementRef.current?.srcObject) {
      const remoteStream = audioElementRef.current.srcObject as MediaStream;
      startRecording(remoteStream);
    }
    return () => {
      stopRecording();
    };
  }, [sessionStatus]);

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
  }, [isAudioPlaybackEnabled]);

  // Log render state
  useEffect(() => {
    console.log("[VoiceTherapyApp] Rendering with state:", { sessionStatus, hasShownError });
  }, [sessionStatus, hasShownError]);

  return (
    <div className="text-base flex flex-col h-screen bg-gray-100 text-gray-800 relative">
      {sessionStatus === "CONNECTING" && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connecting to Voice Service...
              </h3>
              <p className="text-gray-600">Please wait while we establish your voice session.</p>
            </div>
          </div>
        </div>
      )}
      {hasShownError && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Voice Session Unavailable
              </h3>
              <p className="text-gray-600 mb-4">
                Unable to connect to the voice service. This might be due to a configuration issue
                or service unavailability.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={connectToRealtime}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
              <button
                onClick={() => {
                  console.log("[VoiceTherapyApp] Back to Chat Demo button clicked");
                  handleBackToChatDemo();
                }}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
              >
                Back to Chat Demo
              </button>
              <button
                onClick={() => {
                  console.log("[VoiceTherapyApp] Test button clicked - overlay is working");
                  alert("Overlay is working!");
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Test Overlay (Click Me)
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-1 gap-2 px-2 overflow-hidden relative">
        <VoiceTranscript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          downloadRecording={downloadRecording}
          canSend={sessionStatus === "CONNECTED"}
        />
        <VoiceEvents isExpanded={isEventsPaneExpanded} />
      </div>
      <VoiceToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
      />
    </div>
  );
}
