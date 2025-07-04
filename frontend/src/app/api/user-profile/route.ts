import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    try {
        // Verify user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Fetch user profile
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        id,
        email,
        first_name,
        last_name,
        voice_tokens_remaining,
        has_passed_safety_assessment,
        safety_assessment_completed_at,
        created_at,
        updated_at
      `)
            .eq("id", userId)
            .single();

        if (error) {
            console.error("❌ Failed to fetch user profile:", error);
            return NextResponse.json(
                { error: "Failed to fetch profile" },
                { status: 500 },
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 },
            );
        }

        console.log(`✅ User profile fetched for ${userId}:`, {
            id: data.id,
            has_passed_safety_assessment: data.has_passed_safety_assessment,
            safety_assessment_completed_at: data.safety_assessment_completed_at,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ User profile API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
