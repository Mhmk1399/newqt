import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Transaction from "@/models/transaction";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const Transactions = await Transaction.find({});
    console.log(Transactions, "Fetched Transactions: ");

    const filteredData = Transactions.filter((Trans) => {
      // Fixed: changed assignedUserId to users (based on your transaction model)
      return Trans.users?.toString() === id;
    });

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions", // Fixed error message
      },
      { status: 500 }
    );
  }
}
