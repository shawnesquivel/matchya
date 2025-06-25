"use client";
import { VoiceTranscriptProvider } from "./contexts/VoiceTranscriptContext";
import { VoiceEventProvider } from "./contexts/VoiceEventContext";
import VoiceTherapyApp from "./VoiceTherapyApp";

export default function VoiceSession() {
  return (
    <VoiceTranscriptProvider>
      <VoiceEventProvider>
        <VoiceTherapyApp />
      </VoiceEventProvider>
    </VoiceTranscriptProvider>
  );
}
