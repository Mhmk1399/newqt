import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users";
import connect from "@/lib/data";

// GET - Retrieve users for dropdown
export async function GET(request: NextRequest) {
  try {
    await connect();
    const users = await User.find({ isActive: true }).select('_id name email').sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}