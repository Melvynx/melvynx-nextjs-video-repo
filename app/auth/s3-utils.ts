import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// Define the type for S3 PermanentRedirect error
export interface S3RedirectError extends Error {
  Code?: string;
  Endpoint?: string;
}

interface UploadFileParams {
  file: File;
  prefix: string;
  identifier: string;
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
 * Upload a file to S3
 * @param params File and upload parameters
 * @returns The URL of the uploaded file
 */
export async function uploadFileToS3({
  file,
  prefix,
  identifier,
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

  // Generate unique file name
  const fileExtension = file.name.split(".").pop();
  const uniqueFileName = `${prefix}/${identifier}-${Date.now()}.${fileExtension}`;

  // Get S3 client
  const s3Client = getS3Client();

  // Set upload parameters
  const params = {
    Bucket: s3BucketName,
    Key: uniqueFileName,
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
  return `https://${s3BucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
}

/**
 * Delete images from S3 with a specific prefix
 * @param prefix The prefix to filter objects (e.g. "users/123/profile-")
 * @param excludeFileName Optional filename to exclude from deletion
 * @returns The number of deleted images or undefined if error
 */
export async function deleteImages(
  prefix: string,
  excludeFileName?: string
): Promise<number | undefined> {
  try {
    const s3BucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!s3BucketName) {
      console.error("AWS S3 bucket name not configured");
      return;
    }

    // Get S3 client
    const s3Client = getS3Client();

    // List all objects with the given prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: s3BucketName,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    // No objects found
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return 0;
    }

    // Filter out any excluded file if provided
    const objectsToDelete = listedObjects.Contents.filter((obj) => {
      if (!excludeFileName || !obj.Key) return true;
      return !obj.Key.includes(excludeFileName);
    });

    // Delete each object
    let deletedCount = 0;
    for (const object of objectsToDelete) {
      if (object.Key) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: s3BucketName,
          Key: object.Key,
        });

        await s3Client.send(deleteCommand);
        console.log(`Deleted image: ${object.Key}`);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error("Error deleting images:", error);
    // Don't throw - this is a cleanup operation and should not block the main flow
    return undefined;
  }
}

/**
 * Delete all previous profile images for a user
 * @param userId The user ID
 * @param currentFileName The current file name to preserve (optional)
 */
export async function deleteUserProfileImages(
  userId: string,
  currentFileName?: string
) {
  return deleteImages(`${userId}/profile-`, currentFileName);
}
