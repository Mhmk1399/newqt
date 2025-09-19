import { NextRequest, NextResponse } from "next/server";
import contactRequest from "@/models/contactRequest";
import connect from "@/lib/data";
import mongoose from "mongoose";

// GET - Retrieve contact requests
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid ID format" },
          { status: 400 }
        );
      }
      
      const contact = await contactRequest.findById(id);
      if (!contact) {
        return NextResponse.json(
          { success: false, message: "Contact request not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: contact });
    }

    // Build query filters
    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const contacts = await contactRequest
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await contactRequest.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: contacts,
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

// POST - Create new contact request
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, phoneNumber, title, message, type } = body;

    // Validation
    if (!name || !phoneNumber || !title || !message) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const newContact = new contactRequest({
      name,
      phoneNumber,
      title,
      message,
      type: type || 'content'
    });

    const savedContact = await newContact.save();
    
    return NextResponse.json(
      { success: true, message: "Contact request created successfully", data: savedContact },
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

// PUT - Update contact request
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

    const updatedContact = await contactRequest.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return NextResponse.json(
        { success: false, message: "Contact request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact request updated successfully",
      data: updatedContact
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

// DELETE - Delete contact request
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    const deletedContact = await contactRequest.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        { success: false, message: "Contact request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact request deleted successfully",
      data: deletedContact
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
