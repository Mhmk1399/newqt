import { NextRequest, NextResponse } from "next/server";
import CoWorker from "@/models/coWorker";
import connect from "@/lib/data";
import Project from "@/models/customersData/projects";
import jwt from "jsonwebtoken";

// GET - Get all coworkers or single coworker by ID in headers, or authenticated user's profile
export async function GET(request: NextRequest) {
  try {
    await connect();

    const id = request.headers.get("id");
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (token && !id) {
      // Get authenticated user's profile
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const coworker = await CoWorker.findById(decoded.userId)
        .populate({
          path: "projects",
          model: Project,
        })
        .select("-password");

      if (!coworker) {
        return NextResponse.json(
          {
            success: false,
            error: "Coworker not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: coworker,
      });
    } else if (id) {
      // Get single coworker by ID
      const coworker = await CoWorker.findById(id)
        .populate({
          path: "projects",
          model: Project,
        })
        .select("-password");

      if (!coworker) {
        return NextResponse.json(
          {
            success: false,
            error: "Coworker not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: coworker,
      });
    } else {
      // Get all coworkers - filter by approval status based on request
      const showAll = request.nextUrl.searchParams.get("showAll") === "true";
      const filter = showAll ? {} : { isApprove: true };

      const coworkers = await CoWorker.find(filter)
        .populate({
          path: "projects",
          model: Project,
        })
        .populate({
          path: "aprovedBy",
          select: "name email",
        })
        .select("-password");
      return NextResponse.json({
        success: true,
        data: coworkers,
      });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch coworkers",
      },
      { status: 500 }
    );
  }
}

// POST - Create new coworker
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    const coworker = new CoWorker(body);
    await coworker.save();

    return NextResponse.json(
      {
        success: true,
        data: coworker,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create coworker",
      },
      { status: 400 }
    );
  }
}

// PUT - Update coworker (authenticated user updates their own profile)
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const { id, ...updateData } = body;

    // Use authenticated user's ID if no ID provided, or verify ownership
    const targetId = id || decoded.userId;
    if (id && id !== decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized to update this profile",
        },
        { status: 403 }
      );
    }

    const coworker = await CoWorker.findByIdAndUpdate(targetId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!coworker) {
      return NextResponse.json(
        {
          success: false,
          error: "Coworker not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coworker,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update coworker",
      },
      { status: 400 }
    );
  }
}

// PATCH - Approve or decline coworker
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { coworkerId, action } = body;

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!coworkerId || !action) {
      return NextResponse.json(
        { success: false, error: "Coworker ID and action are required" },
        { status: 400 }
      );
    }

    let updateData;
    if (action === "approve") {
      updateData = { aprovedBy: decoded.userId, isApprove: true };
    } else if (action === "decline") {
      updateData = { aprovedBy: null, isApprove: false };
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'approve' or 'decline'" },
        { status: 400 }
      );
    }

    const coworker = await CoWorker.findByIdAndUpdate(coworkerId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("aprovedBy", "name email")
      .select("-password");

    if (!coworker) {
      return NextResponse.json(
        { success: false, error: "Coworker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coworker,
      message: `Coworker ${
        action === "approve" ? "approved" : "declined"
      } successfully`,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update coworker approval status",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete coworker
export async function DELETE(request: NextRequest) {
  try {
    await connect();

    const id = request.headers.get("id");
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID is required",
        },
        { status: 400 }
      );
    }

    const coworker = await CoWorker.findByIdAndDelete(id);

    if (!coworker) {
      return NextResponse.json(
        {
          success: false,
          error: "Coworker not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coworker deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete coworker",
      },
      { status: 400 }
    );
  }
}
