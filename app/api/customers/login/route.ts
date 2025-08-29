import { NextRequest, NextResponse } from "next/server";
import Customer from "@/models/customersData/customers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connect from "@/lib/data";

// POST - Customer login
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    const { phoneNumber, password } = body;

    // Validate required fields
    if (!phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and password are required",
        },
        { status: 400 }
      );
    }

    // Find customer by phone number
    const customer = await Customer.findOne({ phoneNumber });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Check if customer has a password set
    if (!customer.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password not set for this account",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Check if customer is active
    if (!customer.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Account is deactivated",
        },
        { status: 403 }
      );
    }
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error: JWT secret not configured",
        },
        { status: 500 }
      );
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer._id,
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        name: customer.name,
        businessName: customer.businessName,
        verificationStatus: customer.verificationStatus,
        isActive: customer.isActive,
      },
      secretKey,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const customerData = {
      _id: customer._id,
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      businessName: customer.businessName,
      businessScale: customer.businessScale,
      address: customer.address,
      email: customer.email,
      website: customer.website,
      isActive: customer.isActive,
      verificationStatus: customer.verificationStatus,
      verifiedBy: customer.verifiedBy,
      verifiedAt: customer.verifiedAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          customer: customerData,
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
