"use server";

import { prisma } from "@/lib/prisma";
import { authAction } from "@/lib/safe-action";
import { zfd } from "zod-form-data";
import { deleteFileFromS3, uploadFileToS3 } from "./s3-utils";

const Schema = zfd.formData({
  file: zfd.file(),
});

export const imageUserUploadAction = authAction
  .schema(Schema)
  .action(async ({ parsedInput: { file }, ctx: { user } }) => {
    // Upload file to S3
    const imageUrl = await uploadFileToS3({
      file,
      prefix: `user-${user.id}`,
      identifier: "profile",
    });

    console.log(imageUrl.split("/").pop());
    await deleteFileFromS3({
      prefix: `user-${user.id}`,
      excludeFiles: [imageUrl.split("/").pop() ?? ""],
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: imageUrl,
      },
    });

    return updatedUser;
  });
