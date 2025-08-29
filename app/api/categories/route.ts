import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Category from "@/models/category";

export async function GET() {
  try {
    await connect();
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();
    const { name, description, icon } = body;

    if (!name || !description || !icon) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const category = new Category({ name, description, icon });
    await category.save();

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation error:", error);
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
