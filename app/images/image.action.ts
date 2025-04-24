"use server";

import { authAction } from "@/lib/safe-action";
import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { z } from "zod";
import { uploadFileToS3 } from "../auth/s3-utils";

export const generateImageAction = authAction
  .schema(
    z.object({
      prompt: z.string(),
    })
  )
  .action(async ({ parsedInput: { prompt } }) => {
    const result = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt: prompt,
      size: "1024x1024",
    });

    const images = result.images;

    const file: File = new File([images[0].uint8Array], "image.png", {
      type: "image/png",
    });

    const saveImage = await uploadFileToS3({
      file,
      prefix: "gpt-image-1",
      identifier: `${prompt
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 10)}-${Date.now()}`,
    });

    return {
      url: saveImage,
    };
  });
