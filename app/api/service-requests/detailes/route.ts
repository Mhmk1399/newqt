import { NextRequest, NextResponse } from "next/server";
import ServiceRequest from "@/models/customersData/serviceRequests";
import connect from "@/lib/data";

// GET - Get service request by ID
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const serviceRequest = await ServiceRequest.findById(id);

    if (!serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Service request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serviceRequest,
    });
  } catch (error) {
    console.error("GET Service Request Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service request",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update service request by ID
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    const body = await request.json();
    const serviceRequest = await ServiceRequest.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Service request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serviceRequest,
    });
  } catch (error) {
    console.error("PATCH Service Request Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:  "Failed to update service request",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete service request by ID
export async function DELETE(
  request: NextRequest,
) {
  try {
    await connect();
    const id =request.headers.get('id');

    const serviceRequest = await ServiceRequest.findByIdAndDelete(id);

    if (!serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Service request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request deleted successfully",
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(

      {
        success: false,
        error: "Failed to delete service request",
      },
      { status: 500 }
    );
  }
}
