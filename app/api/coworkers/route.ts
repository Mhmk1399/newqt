import { NextRequest, NextResponse } from "next/server";
import CoWorker from "@/models/coWorker";
import User from "@/models/users";
import connect from "@/lib/data";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// GET - Retrieve coworkers with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const isActive = searchParams.get("isActive");
    const isApprove = searchParams.get("isApprove");
    const experties = searchParams.get("experties");
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

      const coworker = await CoWorker.findById(id)
        .populate({
          path: "aprovedBy",
          select: "name email",
          model: User,
        })
        .select('-password');
      
      if (!coworker) {
        return NextResponse.json(
          { success: false, message: "Coworker not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: coworker });
    }

    // Build query filters
    const query: any = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (isApprove !== null && isApprove !== undefined) {
      query.isApprove = isApprove === "true";
    }
    if (experties) {
      query.experties = experties;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const coworkers = await CoWorker.find(query)
      .populate({
        path: "aprovedBy",
        select: "name email",
        model: User,
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CoWorker.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: coworkers,
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

// POST - Create new coworker
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, phoneNumber, password, experties } = body;

    // Validation
    if (!name || !phoneNumber || !password) {
      return NextResponse.json(
        { success: false, message: "Name, phone number, and password are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const coworker = new CoWorker({
      ...body,
      password: hashedPassword
    });
    await coworker.save();

    // Return coworker without password
    const { password: _, ...coworkerWithoutPassword } = coworker.toObject();

    return NextResponse.json(
      { success: true, message: "Coworker created successfully", data: coworkerWithoutPassword },
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

// PUT - Update coworker
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { id, password, ...updateData } = body;

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

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Handle socialLinks nested object properly
    const processedUpdateData = { ...updateData };
    const socialLinksFields: { [key: string]: string } = {};
    
    // Extract socialLinks dot-notation fields
    Object.keys(processedUpdateData).forEach(key => {
      if (key.startsWith('socialLinks.')) {
        const socialKey = key.replace('socialLinks.', '');
        socialLinksFields[socialKey] = processedUpdateData[key];
        delete processedUpdateData[key];
      }
    });
    
    // If we have socialLinks fields, merge them properly
    if (Object.keys(socialLinksFields).length > 0) {
      processedUpdateData.socialLinks = {
        ...processedUpdateData.socialLinks,
        ...socialLinksFields
      };
    }

    const updatedCoworker = await CoWorker.findByIdAndUpdate(
      id,
      { ...processedUpdateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCoworker) {
      return NextResponse.json(
        { success: false, message: "Coworker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coworker updated successfully",
      data: updatedCoworker,
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

// PATCH - Partial update (for toggle operations)
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

    const updatedCoworker = await CoWorker.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCoworker) {
      return NextResponse.json(
        { success: false, message: "Coworker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coworker updated successfully",
      data: updatedCoworker,
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coworker
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    
    // If no ID in query params, try to get it from request body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // Ignore JSON parsing errors
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

    const deletedCoworker = await CoWorker.findByIdAndDelete(id).select('-password');

    if (!deletedCoworker) {
      return NextResponse.json(
        { success: false, message: "Coworker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coworker deleted successfully",
      data: deletedCoworker,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}