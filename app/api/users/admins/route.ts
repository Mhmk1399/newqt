import { NextResponse } from "next/server";
import User from "@/models/users";
import connect from "@/lib/data";

// GET - Get only admin and manager users
export async function GET() {
  try {
    await connect();
    const users = await User.find({ 
      role: { $in: ["admin", "manager"] },
      isActive: true 
    }).select("_id name email role");
    
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin users",
      },
      { status: 500 }
    );
  }
}