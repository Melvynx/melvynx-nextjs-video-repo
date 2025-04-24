import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const getS3Client = () => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set");
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
};

export async function uploadFileToS3(params: {
  file: File;
  prefix: string;
  identifier: string;
  contentType?: string;
}) {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME must be set");
  }

  const s3Client = getS3Client();

  const fileBuffer = await params.file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  const fileExtension = params.file.name.split(".").pop();
  const uniqueFileName = `${params.prefix}/${
    params.identifier
  }-${Date.now()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: uniqueFileName,
    Body: buffer,
    ContentType: params.contentType || params.file.type,
  });

  try {
    await s3Client.send(command);
  } catch {
    console.error("Invalid s3 client send");
  }
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
}

export async function deleteFileFromS3(params: {
  prefix: string;
  excludeFiles?: string[];
}) {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME must be set");
  }

  const s3Client = getS3Client();

  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: params.prefix,
  });

  const listedFiles = await s3Client.send(command);

  if (!listedFiles.Contents) {
    return;
  }

  const filesToDelete = listedFiles.Contents.filter(
    (file) => !params.excludeFiles?.includes(file.Key?.split("/").pop() ?? "")
  );

  const deletePromises = filesToDelete.map((file) => {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.Key,
    });

    return s3Client.send(command);
  });

  await Promise.all(deletePromises);
}
