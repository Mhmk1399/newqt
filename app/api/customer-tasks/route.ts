import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/tasks";
import User from "@/models/users";
import ServiceRequest from "@/models/customersData/serviceRequests";
import connect from "@/lib/data";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface udatedData {
  status?: string;
  completedDate?: Date;
  notes?: string;
}
// GET - Retrieve customer tasks with full population
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Validate authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as {
        userId: string;
        userType: "user" | "admin" | "customer" | "coworker";
      };

      // Only allow customers to access their own tasks or admins to access any
      if (decoded.userType === "customer" && decoded.userId !== customerId) {
        return NextResponse.json(
          {
            success: false,
            message: "Customers can only access their own tasks",
          },
          { status: 403 }
        );
      } else if (
        decoded.userType !== "admin" &&
        decoded.userType !== "customer"
      ) {
        return NextResponse.json(
          { success: false, message: "Access denied" },
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

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json(
        { success: false, message: "Valid customer ID required" },
        { status: 400 }
      );
    }

    const customerTasks = await Task.aggregate([
      {
        $lookup: {
          from: "servicerequests",
          localField: "serviceRequestId",
          foreignField: "_id",
          as: "serviceRequest",
        },
      },
      {
        $addFields: {
          serviceRequestFound: { $size: "$serviceRequest" },
        },
      },
      {
        $match: {
          $or: [
            {
              "serviceRequest.requestedBy": new mongoose.Types.ObjectId(
                customerId
              ),
            },
            { serviceRequestFound: { $eq: 0 } }, // Also include tasks where service request lookup failed for debugging
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedUserId",
          foreignField: "_id",
          as: "assignedUser",
        },
      },
      {
        $addFields: {
          serviceRequestId: { $arrayElemAt: ["$serviceRequest", 0] },
          assignedUserId: { $arrayElemAt: ["$assignedUser", 0] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    // Get total count for pagination (simplified for now while debugging)
    const filteredTasks = customerTasks.filter(
      (task) =>
        task.serviceRequest &&
        task.serviceRequest.length > 0 &&
        task.serviceRequest[0].requestedBy
    );

    const totalTasksAggregate = await Task.aggregate([
      {
        $lookup: {
          from: "servicerequests",
          localField: "serviceRequestId",
          foreignField: "_id",
          as: "serviceRequest",
        },
      },
      {
        $match: {
          "serviceRequest.requestedBy": new mongoose.Types.ObjectId(customerId),
        },
      },
      {
        $count: "total",
      },
    ]);

    const total =
      totalTasksAggregate.length > 0 ? totalTasksAggregate[0].total : 0;

    return NextResponse.json({
      success: true,
      data: filteredTasks, // Return only tasks that actually belong to the customer
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update task (only for customer approval/rejection)
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { taskId, action, rejectionReason } = body;

    // Validate authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header required" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      const token = authHeader.substring(7);
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as {
        userId: string;
        userType: "user" | "admin" | "customer" | "coworker";
      };

      if (decoded.userType !== "customer" && decoded.userType !== "admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Only customers can approve/reject tasks",
          },
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

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json(
        { success: false, message: "Valid task ID required" },
        { status: 400 }
      );
    }

    // Find the task and verify ownership
    const task = await Task.findById(taskId).populate({
      path: "serviceRequestId",
      select: "requestedBy title",
      model: ServiceRequest,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    // Verify customer ownership (unless admin)
    if (
      decoded.userType === "customer" &&
      task.serviceRequestId?.requestedBy?.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow approval/rejection when task status is 'accepted'
    if (task.status !== "accepted") {
      return NextResponse.json(
        {
          success: false,
          message: "Task must be in 'accepted' status to approve or reject",
        },
        { status: 400 }
      );
    }

    const updateData: udatedData = {};

    if (action === "approve") {
      updateData.status = "completed";
      updateData.completedDate = new Date();
    } else if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return NextResponse.json(
          { success: false, message: "Rejection reason is required" },
          { status: 400 }
        );
      }
      updateData.status = "review";
      updateData.notes = `${
        task.notes ? task.notes + "\n\n" : ""
      }مشتری رد کرد: ${rejectionReason}`;
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Use 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
    }).populate([
      {
        path: "serviceRequestId",
        select: "title requestedBy",
        model: ServiceRequest,
      },
      {
        path: "assignedUserId",
        select: "name email",
        model: User,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Task ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
      data: updatedTask,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
