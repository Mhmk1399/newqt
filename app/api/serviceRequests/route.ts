import { NextRequest, NextResponse } from "next/server";
import ServiceRequest from "@/models/customersData/serviceRequests";
import Service from "@/models/customersData/services";
import Customer from "@/models/customersData/customers";
import User from "@/models/users";
import Task from "@/models/tasks";
import connect from "@/lib/data";
import mongoose from "mongoose";

// GET - Retrieve service requests with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID format" },
          { status: 400 }
        );
      }
      
      const serviceRequest = await ServiceRequest.findById(id)
        .populate({
          path: "serviceId",
          select: "name basePrice",
          model: Service,
        })
        .populate({
          path: "requestedBy",
          select: "name phoneNumber",
          model: Customer,
        })
        .populate({
          path: "approvedBy",
          select: "name email",
          model: User,
        })
        .populate({
          path: "asiginedto",
          select: "name email",
          model: User,
        });
        
      if (!serviceRequest) {
        return NextResponse.json(
          { success: false, message: "Service request not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: serviceRequest });
    }

    // Build query filters
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { requirements: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const serviceRequests = await ServiceRequest
      .find(query)
      .populate({
        path: "serviceId",
        select: "name basePrice",
        model: Service,
      })
      .populate({
        path: "requestedBy",
        select: "name phoneNumber",
        model: Customer,
      })
      .populate({
        path: "approvedBy",
        select: "name email",
        model: User,
      })
      .populate({
        path: "asiginedto",
        select: "name email",
        model: User,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ServiceRequest.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: serviceRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new service request
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { title, serviceId, requestedDate, requirements } = body;

    // Validation
    if (!title || !serviceId || !requestedDate || !requirements) {
      return NextResponse.json(
        { success: false, message: "Title, service ID, requested date, and requirements are required" },
        { status: 400 }
      );
    }
    
    const serviceRequest = new ServiceRequest(body);
    await serviceRequest.save();

    return NextResponse.json(
      { success: true, message: "Service request created successfully", data: serviceRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update service request
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const updatedServiceRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedServiceRequest) {
      return NextResponse.json(
        { success: false, message: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request updated successfully",
      data: updatedServiceRequest
    });
  } catch (error) {
    console.error("PUT Error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for toggle operations and assignments)
export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Get the current service request to check for assignment changes
    const currentServiceRequest = await ServiceRequest.findById(id);
    if (!currentServiceRequest) {
      return NextResponse.json(
        { success: false, message: "Service request not found" },
        { status: 404 }
      );
    }

    const updatedServiceRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate({
      path: "serviceId",
      select: "name",
      model: Service,
    });

    // Create tasks for newly assigned users
    if (updateData.asiginedto && Array.isArray(updateData.asiginedto)) {
      const currentAssigned = currentServiceRequest.asiginedto?.map(id => id.toString()) || [];
      const newAssigned = updateData.asiginedto.filter((userId: string) => 
        !currentAssigned.includes(userId)
      );

      // Create tasks for new assignments
      for (const userId of newAssigned) {
        await Task.create({
          serviceRequestId: id,
          assignedUserId: userId,
          title: ` ${updatedServiceRequest?.title || 'Service Request'}`,
          description: ` ${updatedServiceRequest?.title}`,
          status: 'todo',
          priority: updatedServiceRequest?.priority || 'medium',
          dueDate: updatedServiceRequest?.scheduledDate,
          notes: '',
          deliverables: ''
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Service request updated successfully",
      data: updatedServiceRequest
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service request
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
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deletedServiceRequest = await ServiceRequest.findByIdAndDelete(id);

    if (!deletedServiceRequest) {
      return NextResponse.json(
        { success: false, message: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service request deleted successfully",
      data: deletedServiceRequest
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}