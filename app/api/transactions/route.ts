import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transaction";
import User from "@/models/users";
import Customer from "@/models/customersData/customers";
import CoWorker from "@/models/coWorker";
import connect from "@/lib/data";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// GET - Retrieve transactions with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const users = searchParams.get("users"); // Filter by user ID
    const customer = searchParams.get("customer"); // Filter by customer ID
    const coworker = searchParams.get("coworker"); // Filter by coworker ID
    const summary = searchParams.get("summary"); // Request summary data
    const dateFrom = searchParams.get("dateFrom"); // Date range filter start
    const dateTo = searchParams.get("dateTo"); // Date range filter end
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Check if filtering by specific user, customer, or coworker is requested and validate access
    if (users || customer || coworker) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
          ) as {
            userId: string;
            userType: "user" | "admin" | "customer" | "coworker";
          };

          // Admins can access all transactions
          if (decoded.userType === "admin") {
            // Admin has full access, no restrictions
          }
          // Users (staff) can access user transactions
          else if (
            users &&
            decoded.userType === "user" &&
            decoded.userId !== users
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Users can only access their own transactions",
              },
              { status: 403 }
            );
          }
          // Customers can only access their own customer transactions
          else if (
            customer &&
            decoded.userType === "customer" &&
            decoded.userId !== customer
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Customers can only access their own transactions",
              },
              { status: 403 }
            );
          }
          // CoWorkers can only access their own coworker transactions
          else if (
            coworker &&
            decoded.userType === "coworker" &&
            decoded.userId !== coworker
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "CoWorkers can only access their own transactions",
              },
              { status: 403 }
            );
          }
          // Additional validation for cross-type access attempts
          else if (decoded.userType === "coworker" && (users || customer)) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "CoWorkers cannot access user or customer transactions",
              },
              { status: 403 }
            );
          } else if (decoded.userType === "customer" && (users || coworker)) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Customers cannot access user or coworker transactions",
              },
              { status: 403 }
            );
          } else if (decoded.userType === "user" && (customer || coworker)) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Users cannot access customer or coworker transactions without admin privileges",
              },
              { status: 403 }
            );
          }
          // Invalid userType
          else if (
            !["user", "admin", "customer", "coworker"].includes(
              decoded.userType
            )
          ) {
            return NextResponse.json(
              { success: false, message: "Invalid user type" },
              { status: 403 }
            );
          }
        } catch (tokenError) {
          return NextResponse.json(
            { success: false, message: "Invalid token" },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: "Authorization header required" },
          { status: 401 }
        );
      }
    }

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
    if (users && mongoose.Types.ObjectId.isValid(users)) {
      query.users = users;
    }
    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      query.customer = customer;
    }
    // Note: CoWorker transactions would require adding a 'coworker' field to the Transaction model
    if (coworker && mongoose.Types.ObjectId.isValid(coworker)) {
      // This would need a 'coworker' field in the Transaction schema
      // For now, return empty results if coworker filtering is requested
      query.coworker = coworker; // This will return no results since the field doesn't exist
    }
    if (search) {
      query.$or = [{ subject: { $regex: search, $options: "i" } }];
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.date.$lt = endDate;
      }
    }

    // If summary is requested, calculate and return summary data
    if (summary === "true") {
      const transactions = await Transaction.find(query);

      const summaryData = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: transactions.length,
      };

      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          summaryData.totalIncome += transaction.received || 0;
        } else if (transaction.type === "expense") {
          summaryData.totalExpense += transaction.paid || 0;
        }
      });

      summaryData.balance = summaryData.totalIncome - summaryData.totalExpense;

      return NextResponse.json({
        success: true,
        summary: summaryData,
      });
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
