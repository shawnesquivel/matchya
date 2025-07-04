import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        console.log("Hit /api/webhooks");
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
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}

async function createUserProfile(userData: any) {
    try {
        console.log("🔄 Creating user profile in Supabase...");

        // Extract user data from Clerk webhook
        const userId = userData.id;
        const email = userData.email_addresses?.[0]?.email_address || null;
        const firstName = userData.first_name || null;
        const lastName = userData.last_name || null;

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
            throw error;
        }

        console.log("✅ User profile created successfully:", data);
        return data;
    } catch (error) {
        console.error("❌ Failed to create user profile:", error);
        throw error;
    }
}
