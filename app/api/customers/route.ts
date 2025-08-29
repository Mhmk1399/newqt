import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/customersData/customers";
import connect from "@/lib/data";
import bcrypt from "bcryptjs";

///get all the customers
export async function GET() {
  try {
    await connect();
    const customers = await Customer.find({});
    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers"
        +error,
      },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
try {
await connect();
const body = await request.json();

// Hash password if provided
if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    
    const customer = new Customer(body);
    await customer.save();

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create customer",
      },
      { status: 400 }
    );
  }
}
