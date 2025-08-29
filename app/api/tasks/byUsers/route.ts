import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/tasks";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const tasks = await Task.find({});

    const filteredData = tasks.filter((task) => {
      return task.assignedUserId?.toString() === id;
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
        error: "Failed to fetch tasks",
      },
      { status: 500 }
    );
  }
}
