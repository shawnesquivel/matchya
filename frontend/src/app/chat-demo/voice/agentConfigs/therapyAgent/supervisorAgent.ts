import { RealtimeItem, tool } from "@openai/agents/realtime";

export const therapySupervisorInstructions =
  `You are an expert AI therapist conducting brief Cognitive Behavioral Therapy (CBT) sessions. You provide thoughtful, empathetic responses that help users explore their thoughts and feelings.

# Instructions
- Always lead with validation and empathy before offering perspectives or techniques
- Use warm, accessible language - avoid clinical jargon
- Keep responses conversational and voice-appropriate - use prose, not bullet points
- Ask ONE focused question per response maximum
- When introducing CBT concepts, explain them simply and relatably
- If user mentions self-harm or crisis situations, prioritize safety and recommend professional help

# Your Response Style
- Validate emotions first: "That sounds really difficult"
- Explore gently: "Can you tell me more about that?"
- Offer CBT insights: "I notice you're using words like 'always' - let's explore that pattern"
- Suggest practical steps: "What's one small thing you could try today?"

Remember: Create a safe, supportive space for users to explore their thoughts and feelings.`;

export const therapySupervisorTools = [
  {
    type: "function",
    name: "suggestCopingStrategy",
    description: "Suggest a CBT coping strategy for the user's situation",
    parameters: {
      type: "object",
      properties: {
        situation: {
          type: "string",
          description: "Brief description of the user's situation",
        },
      },
      required: ["situation"],
      additionalProperties: false,
    },
  },
];

async function fetchResponsesMessage(body: any) {
  const response = await fetch("/api/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) {
    console.warn("Therapy supervisor returned an error:", response);
    return { error: "Something went wrong with the therapy session." };
  }

  const completion = await response.json();
  return completion;
}

function getTherapyToolResponse(fName: string, args: any) {
  switch (fName) {
    case "suggestCopingStrategy":
      return {
        strategy: "Try a simple breathing exercise or grounding technique",
        guidance:
          "Let's start with noticing 5 things you can see around you right now",
      };
    default:
      return { result: "Tool executed successfully" };
  }
}

async function handleTherapyToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void,
) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) {
      return { error: "Something went wrong with the therapy session." } as any;
    }

    const outputItems: any[] = currentResponse.output ?? [];
    const functionCalls = outputItems.filter(
      (item) => item.type === "function_call",
    );

    if (functionCalls.length === 0) {
      const assistantMessages = outputItems.filter(
        (item) => item.type === "message",
      );

      const finalText = assistantMessages
        .map((msg: any) => {
          const contentArr = msg.content ?? [];
          return contentArr
            .filter((c: any) => c.type === "output_text")
            .map((c: any) => c.text)
            .join("");
        })
        .join("\n");

      return finalText;
    }

    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || "{}");
      const toolRes = getTherapyToolResponse(fName, args);

      if (addBreadcrumb) {
        addBreadcrumb(`[therapySupervisor] function call: ${fName}`, args);
      }
      if (addBreadcrumb) {
        addBreadcrumb(
          `[therapySupervisor] function call result: ${fName}`,
          toolRes,
        );
      }

      body.input.push(
        {
          type: "function_call",
          call_id: toolCall.call_id,
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
        {
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(toolRes),
        },
      );
    }

    currentResponse = await fetchResponsesMessage(body);
  }
}

export const getTherapeuticResponse = tool({
  name: "getTherapeuticResponse",
  description: "Get next therapeutic response from expert CBT supervisor agent",
  parameters: {
    type: "object",
    properties: {
      relevantContextFromLastUserMessage: {
        type: "string",
        description:
          "Key context from the user's most recent message, including emotional tone and content themes",
      },
    },
    required: ["relevantContextFromLastUserMessage"],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { relevantContextFromLastUserMessage } = input as {
      relevantContextFromLastUserMessage: string;
    };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === "message");

    const body: any = {
      model: "gpt-4.1",
      input: [
        {
          type: "message",
          role: "system",
          content: therapySupervisorInstructions,
        },
        {
          type: "message",
          role: "user",
          content: `==== Conversation History ====
          ${JSON.stringify(filteredLogs, null, 2)}
          
          ==== Relevant Context From Last User Message ===
          ${relevantContextFromLastUserMessage}
          `,
        },
      ],
      tools: therapySupervisorTools,
    };

    const response = await fetchResponsesMessage(body);
    if (response.error) {
      return { error: "Something went wrong with the therapy session." };
    }

    const finalText = await handleTherapyToolCalls(
      body,
      response,
      addBreadcrumb,
    );
    if ((finalText as any)?.error) {
      return { error: "Something went wrong with the therapy session." };
    }

    return { nextResponse: finalText as string };
  },
});

export default getTherapeuticResponse;
