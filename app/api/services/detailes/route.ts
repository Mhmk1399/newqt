import { NextRequest, NextResponse } from "next/server";
import Service from "@/models/customersData/services";
import connect from "@/lib/data";

// GET - Get service by ID
export async function GET(
  request: NextRequest,
) {
  try {

    await connect();
    const id=request.headers.get('id');
    const service = await Service.findById(id).populate(
      "teamId",
    );
    

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update service by ID
export async function PATCH(
  request: NextRequest,
) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
    const service = await Service.findByIdAndUpdate(id, body, {
      new: true,
    })

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: service,
      message: "Service updated successfully",
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error:  "Failed to update service",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete service by ID
export async function DELETE(
  request: NextRequest,
) {
  try {
    const id = request.headers.get("id");
    await connect();
    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: "Service not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete service",
      },
      { status: 500 }
    );
  }
}
