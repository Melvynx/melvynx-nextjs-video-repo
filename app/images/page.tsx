/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { generateImageAction } from "./image.action";

export default function RoutePage() {
  const { execute, isExecuting, result } = useAction(generateImageAction);

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const prompt = formData.get("prompt");
          execute({ prompt: prompt as string });
        }}
      >
        <Input name="prompt" />
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? "Generating..." : "Generate"}
        </Button>
      </form>

      {result.data ? <img src={result.data.url} alt="Generated image" /> : null}
      {result.serverError ? (
        <p className="text-red-500">{result.serverError}</p>
      ) : null}
    </div>
  );
}
