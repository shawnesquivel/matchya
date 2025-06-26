import { NextResponse } from "next/server";

export async function POST() {
    console.log("[API] /api/voice-session: Request received");

    try {
        console.log("[API] /api/voice-session: Checking environment variables");
        console.log(
            "[API] NEXT_PUBLIC_SUPABASE_URL:",
            process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
        );
        console.log(
            "[API] SUPABASE_ANON_KEY:",
            process.env.SUPABASE_ANON_KEY ? "SET" : "NOT SET",
        );

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error(
                "[API] /api/voice-session: Missing environment variables",
            );
            return NextResponse.json({
                error: "Missing environment variables",
                supabaseUrl: !!supabaseUrl,
                supabaseKey: !!supabaseKey,
            }, { status: 500 });
        }

        const functionUrl = `${supabaseUrl}/functions/v1/voice-session`;
        console.log(
            "[API] /api/voice-session: Calling Supabase function at:",
            functionUrl,
        );

        const response = await fetch(functionUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
            },
        });

        console.log(
            "[API] /api/voice-session: Supabase response status:",
            response.status,
        );
        console.log(
            "[API] /api/voice-session: Supabase response headers:",
            Object.fromEntries(response.headers.entries()),
        );

        const data = await response.json();
        console.log(
            "[API] /api/voice-session: Supabase response data:",
            JSON.stringify(data, null, 2),
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] /api/voice-session: Error occurred:", error);
        return NextResponse.json({
            error: "Failed to create voice session",
            details: error instanceof Error ? error.message : "Unknown error",
        }, {
            status: 500,
        });
    }
}

export async function GET() {
    return NextResponse.json({ error: "Method Not Allowed. Use POST." }, {
        status: 405,
    });
}
