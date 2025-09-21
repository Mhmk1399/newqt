import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Video from "@/models/video";
import Category from "@/models/category";
import mongoose from "mongoose";

// GET - Retrieve videos with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isActive = searchParams.get("isActive");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID format" },
          { status: 400 }
        );
      }

      const video = await Video.findById(id).populate({
        path: "categoryId",
        select: "name",
        model: Category,
      });

      if (!video) {
        return NextResponse.json(
          { success: false, message: "Video not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: video });
    }

    // Build query filters
    const query: any = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const videos = await Video.find(query)
      .populate({
        path: "categoryId",
        select: "name",
        model: Category,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: videos,
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

// POST - Create new video
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, description, link, categoryId } = body;

    // Validation
    if (!name || !link || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name, link, and category ID are required" },
        { status: 400 }
      );
    }

    const video = new Video(body);
    await video.save();

    return NextResponse.json(
      { success: true, message: "Video created successfully", data: video },
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

// PUT - Update video
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

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
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

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedVideo) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    const deletedVideo = await Video.findByIdAndDelete(id);

    if (!deletedVideo) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
      data: deletedVideo,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
