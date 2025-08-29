import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Video from "@/models/video";

export async function GET() {
  try {
    await connect();
    const videos = await Video.find({ isActive: true })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, description, link, categoryId } = body;

    if (!name || !link || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const video = new Video({ name, description, link, categoryId });
    await video.save();

    const populatedVideo = await Video.findById(video._id).populate(
      "categoryId",
      "name"
    );
    return NextResponse.json(
      { success: true, data: populatedVideo },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, error: "Failed to create video" },
      { status: 500 }
    );
  }
}
