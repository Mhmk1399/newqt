import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/teams";
import connect from "@/lib/data";

// GET - Retrieve teams for dropdown
export async function GET(request: NextRequest) {
  try {
    await connect();
    const teams = await Team.find({ isActive: true }).select('_id name').sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}