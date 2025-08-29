import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Customer from "@/models/customersData/customers";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const customerId = request.headers.get("customerId");
    console.log(customerId , "iddddd")
    const customers = await Customer.find({});
    
    const filteredData = customers.filter(
      (customer) => customer.customerId === customerId
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
        error: "Failed to fetch contracts"+error,
      },
      { status: 500 }
    );
  }
}
