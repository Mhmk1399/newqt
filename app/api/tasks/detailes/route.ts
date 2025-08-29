import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/tasks";
import connect from "@/lib/data";
import ServiceRequest from "@/models/customersData/serviceRequests";
import User from "@/models/users";
import Team from "@/models/teams";

// GET - Get task by ID
export async function GET(
  request: NextRequest,
) {
  try {
    await connect();
    const id = request.headers.get("id");
    const task = await Task.findById(id)
    .populate(
      {path:"serviceRequestId",
      model: ServiceRequest,
       select:"title"})
       .populate({
        path:"assignedUserId",
        model: User,
        select:"name"
       })
       .populate({
        path:"assignedTeamId",
        model: Team,
        select:"name"
       })
     

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("GET Task Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch task",
      },
      { status: 500 }
    );
  }
}



// PATCH - Partial update task by ID
export async function PATCH(
  request: NextRequest,
) {
  try {
    await connect();
    const id =request.headers.get('id');
    const body = await request.json();


    // If status is being changed to completed, set completedDate
    if (body.status === "completed" && !body.completedDate) {
      body.completedDate = new Date();
    }

    const task = await Task.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    console.log("PATCH Response - Updated Task:", task);

    return NextResponse.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("PATCH Task Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:  "Failed to update task",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete task by ID
export async function DELETE(
  request: NextRequest,
) {
  try {
    const id=request.headers.get('id');
    await connect();
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete task",
      },
      { status: 500 }
    );
  }
}
