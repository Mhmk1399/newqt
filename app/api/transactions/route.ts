import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transaction";
import User from "@/models/users";
import Customer from "@/models/customersData/customers";
import connect from "@/lib/data";
import mongoose from "mongoose";

// GET - Retrieve transactions with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
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

      const transaction = await Transaction.findById(id)
        .populate({
          path: "users",
          select: "name email",
          model: User,
        })
        .populate({
          path: "customer",
          select: "name phoneNumber",
          model: Customer,
        });

      if (!transaction) {
        return NextResponse.json(
          { success: false, message: "Transaction not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: transaction });
    }

    // Build query filters
    const query: any = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [{ subject: { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
      .populate({
        path: "users",
        select: "name email",
        model: User,
      })
      .populate({
        path: "customer",
        select: "name phoneNumber",
        model: Customer,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: transactions,
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

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { subject, type, paid, received } = body;

    // Validation
    if (!subject || !type) {
      return NextResponse.json(
        { success: false, message: "Subject and type are required" },
        { status: 400 }
      );
    }

    const transaction = new Transaction(body);
    await transaction.save();

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      },
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

// PUT - Update transaction
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

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
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

// DELETE - Delete transaction
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

    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
      data: deletedTransaction,
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
