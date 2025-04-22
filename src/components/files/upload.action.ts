"use server";

import { canUploadFilesDS } from "@/lib/domain-service/canUploadFiles";
import { ItemType } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";
import { userAction } from "@/lib/safe-action";
import { utapi } from "@/lib/uploadthing";
import { zfd } from "zod-form-data";

const formDataSchema = zfd.formData({
  file: zfd.file(),
});
const fileTypeMap: Record<string, ItemType> = {
  "application/pdf": "PDF",
  "audio/": "AUDIO",
  "video/": "VIDEO",
  "image/": "IMAGE",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCUMENT",
  "application/msword": "DOCUMENT",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "DOCUMENT",
  "application/vnd.ms-excel": "DOCUMENT",
  "text/": "DOCUMENT",
};

const getFileType = (mimeType: string): ItemType => {
  const match = Object.entries(fileTypeMap).find(([key]) =>
    mimeType.startsWith(key)
  );
  return match ? match[1] : "DOCUMENT";
};

export const uploadFileAction = userAction
  .schema(formDataSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const canUploadFiles = await canUploadFilesDS();

    if (!canUploadFiles) {
      throw new Error("You need to upgrade !");
    }

    const file = parsedInput.file;

    const uploadedFile = await utapi.uploadFiles([file]);

    const fileUrl = uploadedFile[0].data?.ufsUrl;

    if (!fileUrl) {
      throw new Error("Failed to upload file");
    }

    const item = await prisma.item.create({
      data: {
        fileUrl,
        name: file.name,
        type: getFileType(file.type),
        userId: user.id,
      },
    });

    return item;
  });
