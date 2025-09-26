import { NextRequest, NextResponse } from "next/server";
import CoWorker from "@/models/coWorker";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    const coworker = await CoWorker.findById(id);

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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch coworker",
      },
      { status: 500 }
    );
  }
}
