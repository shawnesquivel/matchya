import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers for browser requests
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-openai-key",
};

// Handle OPTIONS requests for CORS
function handleCors(req: Request) {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
}

// Interface for image generation response
interface ImageGenerationResponse {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

/**
 * Generate an image using OpenAI's Image API
 */
async function generateImage(
    prompt: string,
    apiKey: string,
): Promise<ImageGenerationResponse> {
    if (!apiKey) {
        return {
            success: false,
            error: "OpenAI API key not provided in request.",
        };
    }

    try {
        console.log("Sending image generation request with prompt:", prompt);

        const response = await fetch(
            "https://api.openai.com/v1/images/generations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-image-1",
                    prompt,
                    n: 1,
                    size: "1024x1024",
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API error:", errorData);

            // Return appropriate error message based on common error codes
            if (response.status === 401) {
                return {
                    success: false,
                    error: "Invalid API key. Please check your OpenAI API key.",
                };
            } else if (response.status === 429) {
                return {
                    success: false,
                    error: "Rate limit exceeded. Please try again later.",
                };
            } else {
                return {
                    success: false,
                    error: errorData.error?.message ||
                        "Failed to generate image. Please try again.",
                };
            }
        }

        const data = await response.json();
        console.log("Image generation response:", data);

        // Check for data structure based on actual API response
        if (data.data && data.data.length > 0) {
            // Check for url or b64_json based on what the API returns
            const imageUrl = data.data[0].url ||
                (data.data[0].b64_json
                    ? `data:image/png;base64,${data.data[0].b64_json}`
                    : null);

            if (imageUrl) {
                return {
                    success: true,
                    imageUrl: imageUrl,
                };
            }
        }

        return {
            success: false,
            error: "No image was generated. Please try a different prompt.",
        };
    } catch (error) {
        console.error("Error generating image:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Stream text completion from OpenAI
 */
async function streamTextCompletion(req: Request, apiKey: string) {
    if (!apiKey) {
        return new Response(
            JSON.stringify({
                success: false,
                error: "OpenAI API key not provided in request.",
            }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }

    try {
        const { prompt } = await req.json();

        // Create a TransformStream for streaming responses
        const encoder = new TextEncoder();
        const stream = new TransformStream();
        const writer = stream.writable.getWriter();

        // Start the streaming response
        const responseInit = {
            headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        };

        // Start the fetch to OpenAI in the background
        const fetchPromise = fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    stream: true,
                }),
            },
        ).then(async (response) => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error("OpenAI API error:", errorText);

                // Prepare error message
                let errorMessage =
                    "An error occurred while streaming the response.";
                if (response.status === 401) {
                    errorMessage =
                        "Invalid API key. Please check your OpenAI API key.";
                } else if (response.status === 429) {
                    errorMessage =
                        "Rate limit exceeded. Please try again later.";
                }

                // Send error as an event
                const errorData = `data: ${
                    JSON.stringify({ error: errorMessage })
                }\n\n`;
                await writer.write(encoder.encode(errorData));
                await writer.close();
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                const errorMessage = "Could not initialize stream reader";
                const errorData = `data: ${
                    JSON.stringify({ error: errorMessage })
                }\n\n`;
                await writer.write(encoder.encode(errorData));
                await writer.close();
                return;
            }

            const decoder = new TextDecoder();
            let buffer = "";

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // Decode the chunk and add it to our buffer
                    buffer += decoder.decode(value, { stream: true });

                    // Process each line in the buffer
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || ""; // Keep the last (potentially incomplete) line in the buffer

                    for (const line of lines) {
                        // Skip empty lines or [DONE]
                        if (!line.trim() || line === "[DONE]") continue;

                        // Each line starts with "data: "
                        if (line.startsWith("data: ")) {
                            try {
                                const jsonStr = line.substring(6); // Remove "data: "
                                if (jsonStr === "[DONE]") continue;

                                const json = JSON.parse(jsonStr);
                                const content = json.choices[0]?.delta?.content;

                                if (content) {
                                    // Format as SSE
                                    const eventData = `data: ${
                                        JSON.stringify({ content })
                                    }\n\n`;
                                    await writer.write(
                                        encoder.encode(eventData),
                                    );
                                }
                            } catch (e) {
                                console.error(
                                    "Error parsing streaming response:",
                                    e,
                                    line,
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error during stream processing:", error);
                const errorData = `data: ${
                    JSON.stringify({ error: "Stream processing error" })
                }\n\n`;
                await writer.write(encoder.encode(errorData));
            } finally {
                await writer.write(encoder.encode("data: [DONE]\n\n"));
                await writer.close();
            }
        }).catch(async (error) => {
            console.error("Fetch error:", error);
            const errorData = `data: ${
                JSON.stringify({ error: "Failed to connect to OpenAI API" })
            }\n\n`;
            await writer.write(encoder.encode(errorData));
            await writer.close();
        });

        // Return the response with the stream
        return new Response(stream.readable, responseInit);
    } catch (error) {
        console.error("Error in text streaming:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error:
                    "An unexpected error occurred while processing your request.",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
}

// Fallback image when API fails
function getFallbackImage(prompt: string): string {
    const hash = Array.from(prompt)
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        .toString()
        .slice(0, 3);

    const services = [
        `https://picsum.photos/seed/${hash}/800/800`,
        `https://source.unsplash.com/random/800x800?${
            encodeURIComponent(prompt)
        }`,
    ];

    const serviceIndex = parseInt(hash) % services.length;
    return services[serviceIndex];
}

// Main handler for the Edge Function
Deno.serve(async (req) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Get OpenAI API key from custom header
    const openaiKey = req.headers.get("x-openai-key") || "";

    try {
        // Simplified responses for debugging
        if (path === "generate-image") {
            // Get request body for the prompt
            try {
                const { prompt } = await req.json();

                if (Deno.env.get("ENABLE_MOCK_RESPONSES") === "true") {
                    // Return mock image data if mocks are enabled
                    return new Response(
                        JSON.stringify({
                            success: true,
                            imageUrl: "https://picsum.photos/seed/123/800/800",
                            message: "Debugging mock image response",
                        }),
                        {
                            headers: {
                                ...corsHeaders,
                                "Content-Type": "application/json",
                            },
                        },
                    );
                } else {
                    // Process actual image generation
                    const result = await generateImage(prompt, openaiKey);
                    return new Response(
                        JSON.stringify(result),
                        {
                            headers: {
                                ...corsHeaders,
                                "Content-Type": "application/json",
                            },
                        },
                    );
                }
            } catch (error) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Invalid request format",
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
        } else if (path === "stream-completion") {
            if (Deno.env.get("ENABLE_MOCK_RESPONSES") === "true") {
                // Return a simple non-streaming response for debugging
                return new Response(
                    JSON.stringify({
                        success: true,
                        content:
                            "## Markdown Support\n\nThis is a mock response with **markdown** formatting support:\n\n- Lists work\n- *Italic text* works\n- **Bold text** works\n\n```js\n// Code blocks work too\nconst demo = () => {\n  console.log('Hello world!');\n};\n```\n\n> Blockquotes are styled properly",
                        message: "Debugging mock text response",
                    }),
                    {
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            } else {
                // Process actual streaming
                return await streamTextCompletion(req, openaiKey);
            }
        } else {
            // Default response for testing basic connectivity
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "OpenAI Service Edge Function is running",
                    path: path || "root",
                    timestamp: new Date().toISOString(),
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error:
                    "An unexpected error occurred while processing your request.",
                message: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
