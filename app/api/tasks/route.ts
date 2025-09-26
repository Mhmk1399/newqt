import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/tasks";
import ServiceRequest from "@/models/customersData/serviceRequests";
import User from "@/models/users";
import connect from "@/lib/data";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (searchParams.get("title")) {
      filter.title = { $regex: searchParams.get("title"), $options: "i" };
    }
    if (searchParams.get("status")) {
      filter.status = searchParams.get("status");
    }
    if (searchParams.get("priority")) {
      filter.priority = searchParams.get("priority");
    }

    // Filter by completion date range
    if (
      searchParams.get("completedDateFrom") ||
      searchParams.get("completedDateTo")
    ) {
      const completedDateFilter: { $gte?: Date; $lte?: Date } = {};

      if (searchParams.get("completedDateFrom")) {
        completedDateFilter.$gte = new Date(
          searchParams.get("completedDateFrom")!
        );
      }

      if (searchParams.get("completedDateTo")) {
        const toDate = new Date(searchParams.get("completedDateTo")!);
        toDate.setHours(23, 59, 59, 999); // End of day
        completedDateFilter.$lte = toDate;
      }

      filter.completedDate = completedDateFilter;
    }

    if (searchParams.get("assignedUserId")) {
      const assignedUserId = searchParams.get("assignedUserId");
      filter.assignedUserId = assignedUserId;

      // Check authorization for user-specific requests
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
          ) as { userId: string; userType: string };

          // Only allow users to access their own tasks (unless admin)
          if (
            decoded.userType !== "admin" &&
            decoded.userId !== assignedUserId
          ) {
            return NextResponse.json(
              { success: false, message: "Unauthorized access to user tasks" },
              { status: 403 }
            );
          }
        } catch (tokenError) {
          console.log(tokenError)
          return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Authorization header required for user-specific requests",
          },
          { status: 401 }
        );
      }
    }

    const skip = (page - 1) * limit;
    const totalItems = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const tasks = await Task.find(filter)
      .populate({
        path: "serviceRequestId",
        model: ServiceRequest,
        select: "title",
      })
      .populate({ path: "assignedUserId", model: User, select: "name email" })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    const task = new Task(body);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate({
        path: "serviceRequestId",
        model: ServiceRequest,
        select: "title",
      })
      .populate({
        path: "assignedUserId",
        model: User,
        select: "name email",
      });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        data: populatedTask,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndUpdate(_id, updateData, { new: true })
      .populate({
        path: "serviceRequestId",
        model: ServiceRequest,
        select: "title",
      })
      .populate({
        path: "assignedUserId",
        model: User,
        select: "name email",
      });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();

    // Try to get ID from query params first
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    // If not in query params, try to get from request body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // If body parsing fails, continue with null id
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Task ID is required" },
        { status: 400 }
      );
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete task",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
