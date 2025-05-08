import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Define the type for S3 PermanentRedirect error
export interface S3RedirectError extends Error {
  Code?: string;
  Endpoint?: string;
}

interface UploadFileParams {
  file: File;
  userId: string;
  type: string; // e.g. 'avatar', 'cover', etc.
  contentType?: string;
}

/**
 * Create and return an S3 client with the proper configuration
 */
function getS3Client() {
  const accessKeyId = process.env.AWS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Upload a file to S3 using a deeper directory structure
 * @param params File and upload parameters
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3({
  file,
  userId,
  type,
  contentType,
}: UploadFileParams): Promise<string> {
  const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  if (!s3BucketName) {
    throw new Error("AWS S3 bucket name not configured");
  }

  // Convert file to buffer
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  // Generate file path with deeper directory structure
  const fileExtension = file.name.split(".").pop();
  const filePath = `users/${userId}/${type}/default.${fileExtension}`;

  // Get S3 client
  const s3Client = getS3Client();

  // Set upload parameters
  const params = {
    Bucket: s3BucketName,
    Key: filePath,
    Body: buffer,
    ContentType: contentType || file.type,
  };

  const command = new PutObjectCommand(params);

  try {
    // Attempt to upload
    await s3Client.send(command);
  } catch (error) {
    // Cast to the S3RedirectError type
    const uploadError = error as S3RedirectError;
    console.error("S3 upload error:", uploadError);

    throw new Error("Failed to upload file to S3");
  }

  // Return the URL of the uploaded file
  return `https://${s3BucketName}.s3.${region}.amazonaws.com/${filePath}`;
}

/**
 * Get the S3 key from a full S3 URL
 * @param url The full S3 URL
 * @returns The S3 key
 */
export function getS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Extract the path without the leading slash
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
}
