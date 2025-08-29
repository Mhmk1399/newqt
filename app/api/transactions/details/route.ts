import connect from "@/lib/data";
import Transaction from "@/models/transaction";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Transaction ID is required",
      }, { status: 400 });
    }

    const transaction = await Transaction.findById(id)
      .populate('users', 'name email')
      .populate('customer', 'name email businessName');
    
    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch transaction",
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Transaction ID is required",
      }, { status: 400 });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update transaction",
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Transaction ID is required",
      }, { status: 400 });
    }

    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete transaction",
    }, { status: 500 });
  }
}