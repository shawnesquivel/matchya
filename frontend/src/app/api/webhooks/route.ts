import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check environment variables
console.log("🔍 Environment check:", {
    supabaseUrl: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
});

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
        const evt = await verifyWebhook(req);
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(`📨 Webhook: ${eventType} (${id})`);

        // Handle events
        switch (evt.type) {
            case "user.created":
                console.log("🎉 Creating user profile:", evt.data.id);
                await createUserProfile(evt.data);
                break;

            case "user.updated":
                console.log("📝 User updated:", evt.data.id);
                break;

            default:
                console.log(`📨 Unhandled event: ${evt.type}`);
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("❌ Webhook error:", err);
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
            console.error("❌ Failed to create user profile:", error);
            throw error;
        }

        console.log("✅ User profile created:", userId);
        return data;
    } catch (error) {
        console.error("❌ Error creating user profile:", error);
        throw error;
    }
}
