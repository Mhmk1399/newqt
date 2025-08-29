import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users";
import connect from "@/lib/data";

// GET - Get user by ID
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    console.log(id,'id user');
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}

// PUT - Update user by ID
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
    const user = await User.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error:  "Failed to update user",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete user by ID
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
