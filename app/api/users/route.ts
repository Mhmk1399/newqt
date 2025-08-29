import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users";
import connect from "@/lib/data";
import bcrypt from "bcryptjs";

// GET - Get all users
export async function GET() {
  try {
    await connect();
    const users = await User.find({}).select("-password"); // Exclude password from response
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Hash password
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const user = new User(body);
    await user.save();

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
      permissions: user.permissions,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 400 }
    );
  }
}
