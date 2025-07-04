import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        // Verify user is authenticated
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const { answers, passed, completedAt } = body;

        console.log(
            `🔒 Safety assessment for user ${userId}: ${
                passed ? "PASSED" : "FAILED"
            }`,
        );

        // Update user profile with safety assessment results
        const { data, error } = await supabase
            .from("profiles")
            .update({
                has_passed_safety_assessment: passed,
                safety_assessment_completed_at: completedAt,
                safety_assessment_answers: answers,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select();

        if (error) {
            console.error("❌ Failed to update safety assessment:", error);
            return NextResponse.json(
                { error: "Failed to save assessment" },
                { status: 500 },
            );
        }

        if (!data || data.length === 0) {
            console.error("❌ User profile not found:", userId);
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 },
            );
        }

        console.log(`✅ Safety assessment saved for user ${userId}`);

        return NextResponse.json({
            success: true,
            passed,
            message: passed
                ? "Safety assessment completed successfully"
                : "Safety assessment indicates need for professional support",
        });
    } catch (error) {
        console.error("❌ Safety assessment error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
