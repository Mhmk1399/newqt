import { NextRequest, NextResponse } from "next/server";
import Service from "@/models/customersData/services";
import connect from "@/lib/data";

// GET - Get all services
export async function GET() {
  try {
    await connect();
    const services = await Service.find({}).populate(
      "teamId",
      "name specialization"
    );
    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}

// POST - Create new service OR fetch services by IDs
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Check if this is a request to fetch services by IDs
    if (body.serviceIds && Array.isArray(body.serviceIds)) {
      const services = await Service.find({
        _id: { $in: body.serviceIds },
      }).populate("teamId", "name specialization");

      return NextResponse.json({
        success: true,
        data: services,
      });
    }

    // Otherwise, create a new service
    const service = new Service(body);
    await service.save();

    // Populate the team data in response
    await service.populate("teamId", "name specialization");

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 400 }
    );
  }
}
