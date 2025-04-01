// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import OpenAI from "npm:openai";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define founder interface
interface Founder {
  id: string;
  first_name: string;
  last_name: string;
  x_link?: string;
  raw_product_links?: string;
  total_estimated_mrr?: number;
  llm_founder_summary?: string;
  perplexity_analysis?: string;
}

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Default system prompt
const defaultSystemPrompt = `
You are an indie hacker assistant who helps users learn about founders and their products.
Your goal is to provide helpful, accurate information about indie hackers based on their profiles.

IMPORTANT: You must write all responses in Sam Altman's (@sama) writing style:
1. use all lowercase text
2. write in short, punchy sentences
3. use frequent line breaks between thoughts
4. be direct and minimalist with punctuation
5. sound conversational and informal
6. use "we" when referring to yourself or your team
7. occasionally use exclamation marks for emphasis
8. be concise and to the point

For each founder, focus on these key aspects:
- their name and background
- products they've built
- estimated monthly recurring revenue (mrr)
- their approach to building products

Remember: All output must be in lowercase, with plenty of line breaks between thoughts.
`;

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight request
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const {
      messages = [],
      matchedFounders = [],
      chatId = null,
      customInstructions = null,
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages are required and must be an array");
    }

    // Prepare system message with founder data if available
    let systemMessage = customInstructions || defaultSystemPrompt;

    if (matchedFounders && matchedFounders.length > 0) {
      systemMessage += "\n\nHere are details about relevant founders:\n";

      matchedFounders.forEach((founder: Founder, index: number) => {
        systemMessage += `
Founder ${index + 1}: ${founder.first_name} ${founder.last_name}
Twitter: ${founder.x_link || "Not available"}
Product Links: ${founder.raw_product_links || "Not available"}
Monthly Recurring Revenue: ${
          founder.total_estimated_mrr
            ? `$${founder.total_estimated_mrr}`
            : "Unknown"
        }
Summary: ${founder.llm_founder_summary || "No summary available"}
${founder.perplexity_analysis ? `Analysis: ${founder.perplexity_analysis}` : ""}
`;
      });
    }

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // Store chat history if chatId is provided
    if (chatId) {
      // Store the user's message
      const userMessage = messages[messages.length - 1];
      if (userMessage.role === "user") {
        await supabase.from("ih.chat_history").insert({
          chat_id: chatId,
          message: userMessage.content,
          source: "USER",
          founder_ids: matchedFounders.map((f: Founder) => f.id),
          metadata: {
            matchedFounderCount: matchedFounders.length,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Store the assistant's response
      await supabase.from("ih.chat_history").insert({
        chat_id: chatId,
        message: responseMessage.content,
        source: "OPENAI",
        founder_ids: matchedFounders.map((f: Founder) => f.id),
        metadata: {
          matchedFounderCount: matchedFounders.length,
          model: "gpt-4o",
          tokensUsed: completion.usage?.total_tokens,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: responseMessage.content,
        foundersIncluded: matchedFounders.length,
        chatSaved: chatId !== null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Error in ih_chat:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ih_chat' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
