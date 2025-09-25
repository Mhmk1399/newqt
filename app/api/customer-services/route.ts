import { NextRequest, NextResponse } from "next/server";
import Service from "@/models/customersData/services";
import Customer from "@/models/customersData/customers";
import connect from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    // If customerId provided, filter services based on customer VIP status
    let query: any = { isActive: true };
    
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return NextResponse.json(
          { success: false, message: "Customer not found" },
          { status: 404 }
        );
      }

      // If customer is not VIP, exclude VIP services
      if (!customer.isVip) {
        query.isVip = false;
      }
    }

    const services = await Service.find(query)
      .populate("teamId", "name specialization")
      .sort({ isVip: 1, basePrice: 1 });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch services",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    
    const { name, description, basePrice, teamId, options, requieredFileds, isVip = false } = body;

    // Validation
    if (!name || !basePrice || !teamId) {
      return NextResponse.json(
        { success: false, message: "Name, base price, and team ID are required" },
        { status: 400 }
      );
    }

    const service = new Service({
      name,
      description,
      basePrice,
      teamId,
      options: options || [],
      requieredFileds: requieredFileds || [],
      isVip,
      isActive: true,
    });

    await service.save();

    const populatedService = await Service.findById(service._id)
      .populate("teamId", "name specialization");

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      data: populatedService,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create service",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}