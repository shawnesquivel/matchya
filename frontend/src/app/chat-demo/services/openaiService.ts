import { COOKIE_NAMES, getCookie } from "../utils/cookieManager";

// Interface for image generation response
interface ImageGenerationResponse {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

// Base URL for Supabase functions
const FUNCTION_BASE_URL = "https://joypkrixfrtsyjcsyeeb.supabase.co" +
    "/functions/v1/openai-service";

// Supabase anon key for authorization (should be available from env)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Generate an image using OpenAI's Image API via Supabase Edge Function
 */
export async function generateImage(
    prompt: string,
): Promise<ImageGenerationResponse> {
    const apiKey = getCookie(COOKIE_NAMES.API_KEY);

    if (!apiKey) {
        return {
            success: false,
            error:
                "No API key found. Please configure your OpenAI API key in settings.",
        };
    }

    try {
        console.log("Sending image generation request with prompt:", prompt);

        const response = await fetch(
            `${FUNCTION_BASE_URL}/generate-image`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "x-openai-key": apiKey,
                },
                body: JSON.stringify({ prompt }),
            },
        );

        if (!response.ok) {
            let errorMessage = "Failed to generate image. Please try again.";

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error("Error parsing error response:", e);
            }

            console.error("Function API error:", errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        }

        const data = await response.json();
        console.log("Image generation response:", data);

        if (data.success && data.imageUrl) {
            return {
                success: true,
                imageUrl: data.imageUrl,
            };
        }

        return {
            success: false,
            error: data.error ||
                "No image was generated. Please try a different prompt.",
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
 * Stream a text completion from OpenAI Chat API via Supabase Edge Function
 * @param prompt The user's message
 * @param onChunk Callback function to handle each chunk of the response
 * @returns An object indicating success or failure
 */
export async function streamTextCompletion(
    prompt: string,
    onChunk: (chunk: string) => void,
): Promise<{ success: boolean; error?: string }> {
    const apiKey = getCookie(COOKIE_NAMES.API_KEY);

    if (!apiKey) {
        return {
            success: false,
            error:
                "No API key found. Please configure your OpenAI API key in settings.",
        };
    }

    try {
        const response = await fetch(
            `${FUNCTION_BASE_URL}/stream-completion`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "x-openai-key": apiKey,
                },
                body: JSON.stringify({ prompt }),
            },
        );

        if (!response.ok) {
            let errorMessage = "Failed to stream response. Please try again.";

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error("Error parsing error response:", e);
            }

            console.error("Function API error:", errorMessage);

            return {
                success: false,
                error: errorMessage,
            };
        }

        // The response will be an event stream
        const reader = response.body?.getReader();

        if (!reader) {
            return {
                success: false,
                error: "Could not initialize stream reader",
            };
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });

            // Process each line in the buffer
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || ""; // Keep the last (potentially incomplete) line in the buffer

            for (const line of lines) {
                if (!line.trim()) continue;

                // Each line starts with "data: "
                if (line.startsWith("data: ")) {
                    try {
                        const jsonStr = line.substring(6); // Remove "data: "
                        if (jsonStr === "[DONE]") continue;

                        const data = JSON.parse(jsonStr);

                        // Check if this is an error message
                        if (data.error) {
                            return {
                                success: false,
                                error: data.error,
                            };
                        }

                        // If it's content, pass it to the callback
                        if (data.content) {
                            onChunk(data.content);
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

        return { success: true };
    } catch (error) {
        console.error("Error streaming text completion:", error);
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Check if the API key is configured
 */
export function hasApiKey(): boolean {
    return !!getCookie(COOKIE_NAMES.API_KEY);
}

/**
 * Fallback image generation when API is not available or fails
 */
export function getFallbackImage(prompt: string): string {
    // Same hash-based placeholder as before
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
