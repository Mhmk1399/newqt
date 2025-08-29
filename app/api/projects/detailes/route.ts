import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/customersData/projects";
import Customer from "@/models/customersData/customers";
import User from "@/models/users"; // Adjust this path
import connect from "@/lib/data";

// GET - Get project by ID
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    console.log(id, "Project ID");
    
    const project = await Project.findById(id)
      .populate({
        path: 'customerId',
        model: Customer,
        select: 'name email phoneNumber'
      })
      .populate({
        path: 'projectManagerId',
        model: User, 
        select: 'name email'
      });
    
    console.log("Populated project:", JSON.stringify(project, null, 2));

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update project by ID
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
    
    const project = await Project.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
    

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        success: false,
        error:  "Failed to update project",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete project by ID
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        success: false,
      error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
}
