import { NextRequest, NextResponse } from "next/server";
import Contract from "@/models/customersData/contracts";
import connect from "@/lib/data";

// GET - Get contract by ID
export async function GET(request: NextRequest) {
  await connect();
  const id = request.headers.get("id");
  console.log(id);
  try {
    const contract = await Contract.findById(id).populate("customerId");

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: "Contract not found",
        },
        { status: 404 }
      );
    }
    console.log(contract);
    return NextResponse.json({
      success: true,
      data: contract,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contract"+error,
      },
      { status: 500 }
    );
  }
}

// PUT - Update contract by ID
export async function PATCH(request: NextRequest) {
  await connect();
  const id = request.headers.get("id");

  try {
    const body = await request.json();
    const contract = await Contract.findByIdAndUpdate(id,body, {
      new: true,
      runValidators: true,
    });

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: "Contract not found",
        },
        { status: 404 }
      );
    }
    console.log(contract)

    return NextResponse.json({
      success: true,
      data: contract,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update contract",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete contract by ID
export async function DELETE(request: NextRequest) {
  await connect();
  const id = request.headers.get("id");
  try {
    const contract = await Contract.findByIdAndDelete(id);

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: "Contract not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contract deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contract"+error,
      },
      { status: 500 }
    );
  }
}
