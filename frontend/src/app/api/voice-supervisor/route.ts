import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/voice-supervisor`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        );
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to call voice supervisor" }, {
            status: 500,
        });
    }
}
