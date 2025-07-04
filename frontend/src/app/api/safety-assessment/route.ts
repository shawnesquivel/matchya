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

        const { answers } = await req.json();

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: "Invalid answers format" },
                { status: 400 },
            );
        }

        // Any "yes" (true) answer means the user has not passed
        const has_passed_safety_assessment = !answers.some((answer) =>
            answer === true
        );
        const safety_assessment_completed_at = new Date().toISOString();

        const { data, error } = await supabase
            .from("profiles")
            .update({
                has_passed_safety_assessment,
                safety_assessment_completed_at,
                safety_assessment_answers: answers,
            })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("❌ Failed to update safety assessment:", error);
            return NextResponse.json(
                { error: "Failed to update safety assessment" },
                { status: 500 },
            );
        }

        console.log(`✅ Safety assessment updated for ${userId}:`, {
            has_passed_safety_assessment: data.has_passed_safety_assessment,
        });

        return NextResponse.json({
            message: "Safety assessment submitted successfully",
            has_passed_safety_assessment: data.has_passed_safety_assessment,
        });
    } catch (error) {
        console.error("❌ Safety assessment API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
