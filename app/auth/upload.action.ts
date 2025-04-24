"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/safe-action";
import { zfd } from "zod-form-data";
import { deleteImages, uploadFileToS3 } from "./s3-utils";

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
      // Upload the file to S3
      const fileUrl = await uploadFileToS3({
        file,
        prefix: user.id,
        identifier: "profile",
      });

      // Delete previous profile images after successful upload
      // We don't need to wait for this to complete
      await deleteImages(`${user.id}/profile-`, fileUrl.split("/").pop());

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
