import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/teams";
import connect from "@/lib/data";

// GET - Get all teams
export async function GET() {
  try {
    await connect();
    const teams = await Team.find({ isActive: true }).select('_id name specialization');
    return NextResponse.json({
      success: true,
      data: teams,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch teams",
      },
      { status: 500 }
    );
  }
}

// POST - Create new team
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    
    const team = new Team(body);
    await team.save();

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create team",
      },
      { status: 400 }
    );
  }
}
