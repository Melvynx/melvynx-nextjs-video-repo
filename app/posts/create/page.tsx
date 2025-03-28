/* eslint-disable react/no-children-prop */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/lib/form/components/tanstack-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

export default function CreatePostPage() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      title: "",
      slug: "",
      content: "",
    },
    validators: {
      // Pass a schema or function to validate
      onSubmit: z.object({
        title: z.string(),
        slug: z
          .string()
          .regex(
            /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers and hyphens"
          ),
        content: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      console.log({ value });
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          body: JSON.stringify({
            title: value.title,
            content: value.content,
            slug: value.slug,
          }),
        });

        if (!res.ok) throw new Error("Failed to create post");

        toast.success("Post created!");
        router.push("/posts");
        router.refresh();
      } catch {
        toast.error("Failed to create post");
      }
    },
  });

  return (
    <Card className="max-w-2xl w-full mx-auto">
      <CardHeader>
        <CardTitle>Create a new post</CardTitle>
        <CardDescription>Share your thoughts with the world</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <form.AppField
              name="title"
              children={(field) => (
                <field.Input placeholder="Enter post title" label="Title" />
              )}
            />

            <form.AppField
              name="slug"
              children={(field) => (
                <field.Input placeholder="url-friendly-title" label="Slug" />
              )}
            />

            <form.AppField
              name="content"
              children={(field) => (
                <field.Textarea
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                  label="Content"
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton>Submit</form.SubmitButton>
            </form.AppForm>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
