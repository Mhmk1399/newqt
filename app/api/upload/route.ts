import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

// Allowed file types and size limits (including common video types)
const ALLOWED_TYPES = [
  // images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  // documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  // videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/mpeg",
  "video/x-msvideo",
  "video/3gpp",
];

// Make max upload size configurable via `MAX_UPLOAD_SIZE` env var (bytes).
// Default to 200MB to allow typical video uploads. Adjust on the platform if needed.
const MAX_FILE_SIZE =
  process.env.MAX_UPLOAD_SIZE && !Number.isNaN(Number(process.env.MAX_UPLOAD_SIZE))
    ? Number(process.env.MAX_UPLOAD_SIZE)
    : 200 * 1024 * 1024; // 200MB

export async function POST(req: NextRequest) {
  try {
    // Check if required environment variables are set
    if (!process.env.LIARA_BUCKET_NAME) {
      console.log("LIARA_BUCKET_NAME environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type ${
            file.type
          } not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size too large. Maximum size: ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);

    // Extract file extension
    const extension = file.name.includes(".")
      ? `.${file.name.split(".").pop() || ""}`
      : "";

    // Check if filename contains non-ASCII characters (e.g., Persian)
    const hasNonAscii = /[^\x00-\x7F]/.test(file.name);

    let cleanFileName: string;
    if (hasNonAscii) {
      // If non-ASCII (e.g., Persian), generate a fully English name without original filename
      cleanFileName = `${timestamp}_${randomId}${extension}`;
      console.log(
        `Non-ASCII filename detected: ${file.name}. Using generated name: ${cleanFileName}`
      );
    } else {
      // Otherwise, use the existing cleaning logic
      cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      cleanFileName = `${timestamp}_${randomId}_${cleanFileName}`;
    }

    // Place videos in a dedicated folder to keep the bucket organized
    const folder = file.type && file.type.startsWith("video/") ? "qt/videos" : "qt";
    const key = `${folder}/${cleanFileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // URL-encode metadata values to handle special characters (e.g., Persian in originalName)
    const encodedOriginalName = encodeURIComponent(file.name);

    // Upload to Liara Object Storage
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: encodedOriginalName,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
      },
    });

    const uploadResult = await s3.send(uploadCommand);

    console.log(uploadResult);

    // Generate public URL for Liara Object Storage
    const bucketName = process.env.LIARA_BUCKET_NAME;
    const publicUrl = `https://${bucketName}.storage.c2.liara.space/${key}`;

    return NextResponse.json({
      success: true,
      data: {
        key,
        url: publicUrl,
        originalName: file.name, // Return unencoded for user convenience
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.log("Upload error:", error);

    // Handle specific Liara Object Storage errors
    if (error instanceof Error) {
      if (error.name === "NoSuchBucket") {
        return NextResponse.json(
          { success: false, error: "Liara bucket not found" },
          { status: 500 }
        );
      }

      if (error.name === "AccessDenied") {
        return NextResponse.json(
          { success: false, error: "Access denied to Liara bucket" },
          { status: 500 }
        );
      }

      if (
        error.name === "CredentialsError" ||
        error.name === "InvalidAccessKeyId"
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid Liara Object Storage credentials" },
          { status: 500 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { success: false, error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload service status
export async function GET() {
  try {
    const requiredVars = [
      "LIARA_BUCKET_NAME",
      "LIARA_ENDPOINT",
      "LIARA_ACCESS_KEY",
      "LIARA_SECRET_KEY",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          missing: missingVars,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Liara Object Storage upload service is configured and ready",
      config: {
        bucket: process.env.LIARA_BUCKET_NAME,
        endpoint: process.env.LIARA_ENDPOINT,
        allowedTypes: ALLOWED_TYPES,
        maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check service status",
      },
      { status: 500 }
    );
  }
}
