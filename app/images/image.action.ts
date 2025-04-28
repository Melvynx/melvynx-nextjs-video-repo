"use server";

import { openai } from "@/lib/openai";
import { experimental_generateImage as generateImage } from "ai";
import { uploadFileToS3 } from "../auth/s3-utils";

export const generateImageAction = async (prompt: string) => {
  const result = await generateImage({
    model: openai.image("gpt-image-1"),
    prompt,
    n: 1,
  });

  const image = result.images[0];

  const sanitizedPrompt = prompt
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .substring(0, 20);
  const fileName = `${sanitizedPrompt}-${Date.now()}.png`;

  const file = new File([image.uint8Array], fileName, {
    type: "image/png",
  });

  const imageUrl = await uploadFileToS3({
    file,
    prefix: "gpt-image-1",
    identifier: sanitizedPrompt,
  });

  return imageUrl;
};
