
import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transaction";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const customer = request.headers.get("customerId");
    
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer ID is required",
        },
        { status: 400 }
      );
    }

    const transactions = await Transaction.find({});
    console.log(transactions, "Fetched Transactions: ");

    // Filter transactions by customer ID
    const filteredData = transactions.filter((transaction) => {
      return transaction.customer?.toString() === customer;
    });

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer transactions",
      },
      { status: 500 }
    );
  }
}
