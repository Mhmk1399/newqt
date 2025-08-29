import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Contract from "@/models/customersData/contracts";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const customerId = request.headers.get("customerId");
    const contracts = await Contract.find({});
    const filteredData = contracts.filter(
      (contract) => contract.customerId === customerId
    );
    console.log(filteredData);
    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contracts" + error,
      },
      { status: 500 }
    );
  }
}
