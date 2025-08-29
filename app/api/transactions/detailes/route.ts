import connect from "@/lib/data";
import Transaction from "@/models/transaction";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const transaction = await Transaction.findById(id);
    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json({
      success: false,
      error: "Failed to fetch transaction data",
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();
    const transaction = await Transaction.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json({
      success: false,
      error: "Failed to update transaction data",
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const transaction = await Transaction.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json({
      success: false,
      error: "Failed to delete transaction",
    });
  }
}
