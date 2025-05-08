"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/safe-action";
import { zfd } from "zod-form-data";
import { uploadFileToS3 } from "./s3-utils";

const Schema = zfd.formData({
  file: zfd.file().optional(),
});

export const uploadProfileAction = authAction
  .schema(Schema)
  .action(async ({ parsedInput, ctx }) => {
    const { file } = parsedInput;
    const { user } = ctx;

    if (!file) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: null },
      });

      return { success: true, url: null };
    }

    try {
      const fileUrl = await uploadFileToS3({
        file,
        path: `users/${user.id}/avatar`,
        fileName: "default",
      });

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
