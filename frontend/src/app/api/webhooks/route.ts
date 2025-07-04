import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables
console.log("🔍 Environment Variables Check:");
console.log(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "❌ MISSING",
);
console.log(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey
        ? `${supabaseServiceKey.substring(0, 30)}...`
        : "❌ MISSING",
);

if (!supabaseUrl || !supabaseServiceKey) {
    const error = `Missing required environment variables: ${
        !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""
    }${!supabaseServiceKey ? "SUPABASE_SERVICE_ROLE_KEY " : ""}`;
    console.error("❌", error);
    throw new Error(error);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        console.log("🎯 Hit /api/webhooks");
        console.log(
            "🔍 Request headers:",
            Object.fromEntries(req.headers.entries()),
        );

        const evt = await verifyWebhook(req);
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(
            `Received webhook with ID ${id} and event type of ${eventType}`,
        );
        console.log("Webhook payload:", evt.data);

        // Log all events to help debug
        switch (evt.type) {
            case "user.created":
                console.log("🎉 NEW USER CREATED:", evt.data.id);

                // Create user profile in Supabase
                await createUserProfile(evt.data);
                break;

            case "user.updated":
                console.log("📝 USER UPDATED:", evt.data.id);
                break;

            case "session.created":
                console.log(
                    "🆕 SESSION CREATED for user:",
                    (evt.data as any).user_id,
                );
                break;

            default:
                console.log(
                    `📨 Other event: ${evt.type} for user:`,
                    evt.data.id || (evt.data as any).user_id,
                );
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("❌ Error verifying webhook:", err);
        console.error("❌ Error type:", typeof err);
        console.error("❌ Error details:", {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            name: err instanceof Error ? err.name : undefined,
        });

        // Return more specific error message
        const errorMessage = err instanceof Error
            ? err.message
            : "Unknown error";
        return new Response(`Error verifying webhook: ${errorMessage}`, {
            status: 400,
        });
    }
}

async function createUserProfile(userData: any) {
    try {
        console.log("🔄 Creating user profile in Supabase...");
        console.log(
            "🔍 Supabase client initialized with environment variables",
        );

        // Extract user data from Clerk webhook
        const userId = userData.id;
        const email = userData.email_addresses?.[0]?.email_address || null;
        const firstName = userData.first_name || null;
        const lastName = userData.last_name || null;

        console.log("👤 User data to insert:", {
            id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            voice_tokens_remaining: 3,
            has_passed_safety_assessment: false,
        });

        // Test Supabase connection first
        console.log("🔍 Testing Supabase connection...");
        const { data: testData, error: testError } = await supabase
            .from("profiles")
            .select("count")
            .limit(1);

        if (testError) {
            console.error("❌ Supabase connection test failed:", testError);
            throw new Error(`Supabase connection failed: ${testError.message}`);
        }

        console.log("✅ Supabase connection successful");

        // Create profile record
        const { data, error } = await supabase
            .from("profiles")
            .insert([
                {
                    id: userId, // Use Clerk user ID as primary key
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    voice_tokens_remaining: 3, // Free tier gets 3 voice tokens
                    has_passed_safety_assessment: false, // Must complete safety assessment
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            console.error("❌ Error creating user profile:", error);
            console.error("❌ Error details:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
            throw error;
        }

        console.log("✅ User profile created successfully:", data);
        return data;
    } catch (error) {
        console.error("❌ Failed to create user profile:", error);
        console.error("❌ Error type:", typeof error);
        console.error("❌ Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
}
