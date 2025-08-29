import { NextRequest, NextResponse } from "next/server";
import ServiceRequest from "@/models/customersData/serviceRequests";
import connect from "@/lib/data";
import Service from "@/models/customersData/services";
import Project from "@/models/customersData/projects";

// GET - Get all service requests
export async function GET() {
  try {
    await connect();
    const serviceRequests = await ServiceRequest.find({}).populate({
      path:"serviceId",
      model: Service,
    }).populate({
      path:"projectId",
      model: Project,
    });

    return NextResponse.json({
      success: true,
      data: serviceRequests,
    });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch service requests",
      },
      { status: 500 }
    );
  }
}

// POST - Create new service request
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const serviceRequest = new ServiceRequest(body);
    await serviceRequest.save();

    return NextResponse.json(
      {
        success: true,
        data: serviceRequest,
      },
      { status: 201 }
    );
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create service request",
      },
      { status: 400 }
    );
  }
}
