import { therapyAgentScenario } from "./therapyAgent";

import type { RealtimeAgent } from "@openai/agents/realtime";

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  therapyAgent: therapyAgentScenario,
};

export const defaultAgentSetKey = "therapyAgent";
