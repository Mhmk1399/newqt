import connect from "@/lib/data";
import Customer from "@/models/customersData/customers";
import Transaction from "@/models/transaction";
import User from "@/models/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const transaction = await Transaction.create(body);
    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.log("Error creating transaction:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create transaction",
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();
    const transactions = await Transaction.find()
      .populate({path:'users', 
        model: User,
       select: 'name email'})
      .populate({path:'customer',
        model:Customer,
        select: 'name email businessName'})
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch transactions",
    }, { status: 500 });
  }
}
