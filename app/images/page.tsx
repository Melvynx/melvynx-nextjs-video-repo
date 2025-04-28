/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { generateImageAction } from "./image.action";

export default function RoutePage() {
  // const { execute, isExecuting, result } = useAction(generateImageAction);
  const [isExecuting, setIsExecuting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageGeneration = async (prompt: string) => {
    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const imageUrl = await generateImageAction(prompt);
    setImageUrl(imageUrl);
    setIsExecuting(false);
  };

  return (
    <div>
      <form
        className="flex gap-2 flex-col"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const prompt = formData.get("prompt");
          await handleImageGeneration(prompt as string);
        }}
      >
        <Input name="prompt" />
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? "Generating..." : "Generate"}
        </Button>
      </form>
      <div className="mt-4">
        {imageUrl && <img src={imageUrl} alt="Generated image" />}
      </div>
    </div>
  );
}
