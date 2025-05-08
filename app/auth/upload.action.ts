"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/safe-action";
import { zfd } from "zod-form-data";
import { uploadFileToS3 } from "./s3-utils";

const Schema = zfd.formData({
  file: zfd.file(),
});

export const uploadProfileAction = authAction
  .schema(Schema)
  .action(async ({ parsedInput, ctx }) => {
    const { file } = parsedInput;
    const { user } = ctx;

    if (!file) {
      throw new Error("No file uploaded");
    }

    try {
      // Upload the file to S3 with the new directory structure
      // This will automatically replace any existing file at the same path
      const fileUrl = await uploadFileToS3({
        file,
        userId: user.id,
        type: "avatar",
      });

      // Update user profile with the new image URL
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { image: fileUrl },
      });

      return {
        success: true,
        url: fileUrl,
        updatedUser,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    }
  });

export const deleteProfileImageAction = authAction
  .schema(zfd.formData({}))
  .action(async ({ ctx }) => {
    const { user } = ctx;

    // Instead of deleting, we can just update the user to remove the image reference
    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    return { success: true };
  });
