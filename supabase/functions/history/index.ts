import { createClient } from "@supabase/supabase-js";

const initStartTime = performance.now();
console.log("[Timing] Starting function initialization");

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

console.log(
  "[Timing] Function initialization completed in",
  performance.now() - initStartTime,
  "ms"
);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  const authorization = req.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables");
    return new Response(
      JSON.stringify({
        error: "Missing environment variables.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  if (!authorization) {
    console.log("No authorization header passed", req.headers);
    return new Response(
      JSON.stringify({ error: `No authorization header passed` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { authorization } },
    auth: { persistSession: false },
  });

  if (!authorization) {
    return new Response("No authorization header passed", { status: 401 });
  }
  let queryChatId;
  const { user_id, chat_id } = await req.json();
  if (!chat_id) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }
  queryChatId = chat_id;
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", user_id)
    .eq("chat_id", queryChatId); // Include chatId in the query
  console.log("data", data);

  // if no messages, log that
  if (data?.length === 0) {
    console.log(
      `No messages found for user ${user_id} and chat_id ${queryChatId}`
    ); // Use chatId here
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
