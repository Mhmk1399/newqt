import { S3Client } from "@aws-sdk/client-s3";

// Check for required environment variables for Liara Object Storage
const requiredVars = ["LIARA_ENDPOINT", "LIARA_ACCESS_KEY", "LIARA_SECRET_KEY"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.log(
    "Missing Liara Object Storage environment variables:",
    missingVars
  );
  throw new Error(
    `Missing required Liara Object Storage environment variables: ${missingVars.join(
      ", "
    )}`
  );
}

export const s3 = new S3Client({
  region: "default",
  endpoint: process.env.LIARA_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
  forcePathStyle: true,
});
