import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/teams";
import connect from "@/lib/data";
import mongoose from "mongoose";

interface filterquery {
  isActive?: boolean;
  isVip?: boolean;
  businessScale?: string;
  status?: string;
  type?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
    specialization?: { $regex: string; $options: string };
    phoneNumber?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
}
// GET - Retrieve teams with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Simple dropdown request
    if (searchParams.get("dropdown") === "true") {
      const teams = await Team.find({ isActive: true })
        .select("_id name")
        .sort({ name: 1 });
      return NextResponse.json({ success: true, data: teams });
    }

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID format" },
          { status: 400 }
        );
      }

      const team = await Team.findById(id);

      if (!team) {
        return NextResponse.json(
          { success: false, message: "Team not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: team });
    }

    // Build query filters
    const query: filterquery = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const teams = await Team.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new team
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, specialization, description } = body;

    // Validation
    if (!name || !specialization || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, specialization, and description are required",
        },
        { status: 400 }
      );
    }

    const team = new Team(body);
    await team.save();

    return NextResponse.json(
      { success: true, message: "Team created successfully", data: team },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update team
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for toggle operations)
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete team
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    // If no ID in query params, try to get it from request body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Ignore JSON parsing errors
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deletedTeam = await Team.findByIdAndDelete(id);

    if (!deletedTeam) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
      data: deletedTeam,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
