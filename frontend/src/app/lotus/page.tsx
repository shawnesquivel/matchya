"use client";
import React from "react";
import LotusPanel from "../chat-demo/LotusPanel";
import { LotusProvider } from "../chat-demo/LotusContext";
import "../chat-demo/styles/markdown.css";

export default function LotusPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Simple header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-lg font-medium text-gray-800">Lotus CBT Session</h1>
      </header>

      {/* Main content - the Lotus chat panel */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full">
          <LotusProvider>
            <LotusPanel />
          </LotusProvider>
        </div>
      </main>
    </div>
  );
}
