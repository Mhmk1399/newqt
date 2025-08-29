import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connect from "@/lib/data";
import User from "@/models/users";
import Customer from "@/models/customersData/customers";
import CoWorker from "@/models/coWorker";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { userId } = await request.json();
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ exists: false }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: string;
      userType: string;
    };

    // Verify userId matches token
    if (decoded.userId !== userId) {
      return NextResponse.json({ exists: false }, { status: 401 });
    }

    // Check user exists in appropriate model based on userType
    let userExists: unknown = null;

    if (decoded.userType === "user") {
      userExists = await User.findById(userId);
    } else if (decoded.userType === "customer") {
      userExists = await Customer.findById(userId);
    } else if (decoded.userType === "coworker") {
      userExists = await CoWorker.findById(userId);
    }

    return NextResponse.json({ exists: !!userExists });
  } catch (error: unknown) {
    console.log(error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
