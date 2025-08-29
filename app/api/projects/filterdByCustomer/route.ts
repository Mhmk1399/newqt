import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Project from "../../../../models/customersData/projects";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const customerId = request.headers.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer ID is required in headers",
        },
        { status: 400 }
      );
    }

    const projects = await Project.find({});

    const filteredData = projects.filter((project) => {
      // Convert ObjectId to string for comparison
      console.log("Project Customer ID:", project.customerId.toString());
      return project.customerId.toString() === customerId;
    });

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error filtering projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}
