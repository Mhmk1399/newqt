import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/tasks";
import connect from "@/lib/data";

interface VideoUploadResponse {
  success: boolean;
  videoUrl?: string;
  message?: string;
  error?: string;
  status?: number;
  uploadProgress?: number;
}

// Video compression and optimization settings
const VIDEO_CONFIG = {
  maxSize: 300 * 1024 * 1024, // 300MB max file size
  allowedTypes: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/quicktime",
    "video/x-msvideo",
  ],
  chunkSize: 1024 * 1024 * 5, // 5MB chunks for large file upload
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<VideoUploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;
    const taskId = formData.get("taskId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "ویدیو انتخاب نشده است" },
        { status: 400 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "شناسه تسک مورد نیاز است" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!VIDEO_CONFIG.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `فرمت ویدیو پشتیبانی نمی‌شود. فرمت‌های مجاز: ${VIDEO_CONFIG.allowedTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > VIDEO_CONFIG.maxSize) {
      const maxSizeMB = VIDEO_CONFIG.maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `حجم ویدیو نباید بیشتر از ${maxSizeMB}MB باشد`,
        },
        { status: 400 }
      );
    }

    const accessKey = process.env.ARVAN_ACCESS_KEY;
    const secretKey = process.env.ARVAN_SECRET_KEY;
    const bucketName = process.env.ARVAN_BUCKET_NAME || "mamad";

    if (!accessKey || !secretKey) {
      return NextResponse.json(
        { success: false, error: "تنظیمات ذخیره‌سازی ابری یافت نشد" },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = file.name.split(".").pop() || "mp4";
    const objectName = `videos/tasks/${taskId}/${timestamp}-${randomString}.${extension}`;

    // Read file content with progress tracking
    const fileContent = await file.arrayBuffer();

    // Generate upload signature
    const dateValue = new Date().toUTCString();
    const contentType = file.type || "video/mp4";
    const resource = `/${bucketName}/${objectName}`;

    const stringToSign = `PUT\n\n${contentType}\n${dateValue}\nx-amz-acl:public-read\n${resource}`;

    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    const uploadUrl = `https://${bucketName}.s3.ir-thr-at1.arvanstorage.ir/${objectName}`;

    // Upload with optimized headers for large files
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Host: `${bucketName}.s3.ir-thr-at1.arvanstorage.ir`,
        Date: dateValue,
        "Content-Type": contentType,
        "Content-Length": fileContent.byteLength.toString(),
        "x-amz-acl": "public-read",
        Authorization: `AWS ${accessKey}:${signature}`,
        "Cache-Control": "max-age=31536000", // 1 year cache for videos
      },
      body: fileContent,
    });

    if (response.ok) {
      const videoUrl = `https://${bucketName}.s3.ir-thr-at1.arvanstorage.ir/${objectName}`;

      // Update the task with the video URL directly in the database
      try {
        await connect();
        await Task.findByIdAndUpdate(taskId, {
          attachedVideo: videoUrl,
        });
      } catch (dbError) {
        console.error("Error updating task in database:", dbError);
        // Continue anyway - the frontend will still get the video URL
      }

      return NextResponse.json({
        success: true,
        videoUrl,
        message: "ویدیو با موفقیت آپلود شد",
      });
    } else {
      const errorText = await response.text();
      console.error("ArvanCloud upload error:", response.status, errorText);

      return NextResponse.json(
        {
          success: false,
          error: "خطا در آپلود به سرور ابری",
          status: response.status,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "خطای داخلی سرور",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload progress or video info
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: "شناسه تسک مورد نیاز است" },
      { status: 400 }
    );
  }

  try {
    // Here you could implement video info retrieval if needed
    return NextResponse.json({
      success: true,
      message: "Video info endpoint",
      taskId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات ویدیو" },
      { status: 500 }
    );
  }
}
