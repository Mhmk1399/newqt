import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/customersData/customers";
import connect from "@/lib/data";

// GET - Get customer by ID
export async function GET(request: NextRequest) {
  await connect();
  const id = request.headers.get("id");
  try {
    const customer = await Customer.findById({ _id: id });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer",
      },
      { status: 500 }
    );
  }
}

// PUT - Update customer by ID
export async function PATCH(request: NextRequest) {
  const id = request.headers.get("id");
  await connect();

  try {
    const body = await request.json();
    const customer = await Customer.findByIdAndUpdate(id, body);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update customer",
      },
      { status: 400 }
    );
  }
}

// DELETE - Delete customer by ID
export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id");
  await connect();
  try {
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete customer"+error,
      },
      { status: 500 }
    );
  }
}


