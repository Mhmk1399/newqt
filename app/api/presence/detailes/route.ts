import { NextRequest,NextResponse } from "next/server";
import connect from "@/lib/data";
import Presence from "@/models/persence";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id =request.headers.get('id');
    const presence = await Presence.findById(id);
    return NextResponse.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch presence data"+error,
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id =request.headers.get('id');
    const body = await request.json();
    const presence = await Presence.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json({
      success: true,
      data: presence,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to update presence data"+error,
    });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id =request.headers.get('id');
     await Presence.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Presence data deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to delete presence data"+error,
    });
  }
}


