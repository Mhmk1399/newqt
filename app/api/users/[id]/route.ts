import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users";
import connect from "@/lib/data";
import jwt from "jsonwebtoken";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string; userType: string };

      // Users can only access their own data (unless admin)
      if (decoded.userType !== "admin" && decoded.userId !== id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized access" },
          { status: 403 }
        );
      }
    } catch (tokenError) {
      console.log(tokenError);
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await User.findById(id)
      .select("-password") // Exclude password from response
      .populate({
        path: "teamId",
        select: "name specialization amount",
      });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
