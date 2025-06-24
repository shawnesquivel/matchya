import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/voice-session`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create voice session" }, {
            status: 500,
        });
    }
}

export async function GET() {
    return NextResponse.json({ error: "Method Not Allowed. Use POST." }, {
        status: 405,
    });
}
