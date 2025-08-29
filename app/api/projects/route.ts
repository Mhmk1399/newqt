import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/customersData/projects";

import Customer from "@/models/customersData/customers";
import User from "@/models/users";
import connect from "@/lib/data";

// GET - Get all projects

export async function GET() {
  try {
    await connect();

    // Get all projects first
    const projects = await Project.find({}).sort({ createdAt: -1 });

    // Manually populate the data
    const populatedProjects = await Promise.all(
      projects.map(async (project) => {
        const projectObj = project.toObject();

        // Get customer data
        if (projectObj.customerId) {
          try {
            const customer = await Customer.findById(
              projectObj.customerId
            ).select("name email phoneNumber");
            if (customer) {
              projectObj.customerId = customer;
            }
          } catch (error) {
            console.error("Error fetching customer:", error);
          }
        }

        // Get project manager data
        if (projectObj.projectManagerId) {
          try {
            const projectManager = await User.findById(
              projectObj.projectManagerId
            ).select("name email");
            if (projectManager) {
              projectObj.projectManagerId = projectManager;
            }
          } catch (error) {
            console.error("Error fetching project manager:", error);
          }
        }

        return projectObj;
      })
    );

    console.log(
      "Populated projects sample:",
      JSON.stringify(populatedProjects[0], null, 2)
    );

    return NextResponse.json({
      success: true,
      data: populatedProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = new Project(body);
    await project.save();

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error:  "Failed to create project",
      },
      { status: 400 }
    );
  }
}
