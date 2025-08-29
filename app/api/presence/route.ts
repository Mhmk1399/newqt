import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Presence from "@/models/persence";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const presence = await Presence.create(body);
    return NextResponse.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create presence"+error,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();
    const presence = await Presence.find();
    return NextResponse.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch presence"+error,
      },
      { status: 500 }
    );
  }
}
