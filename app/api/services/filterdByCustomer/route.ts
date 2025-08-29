import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Service from "@/models/customersData/services";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const customerId = request.headers.get("customerId");
    const services = await Service.find({});
    const filteredData = services.filter(
      (service) => service.customerId === customerId
    );
    console.log(filteredData);
    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
        console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contracts",
      },
      { status: 500 }
    );
  }
}
