"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { User } from "better-auth";
import { useRouter } from "next/navigation";
import { uploadProfileAction } from "./upload.action";
import { UserImageForm } from "./user-image-form";

interface ProfileImageUploaderProps {
  user: User;
}

export function ProfileImageUploader({ user }: ProfileImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const { execute } = useAction(uploadProfileAction, {
    onExecute() {
      setUploading(true);
    },
    onSuccess() {
      setUploading(false);
      toast.success("Profile image updated successfully");
      // Optional: Update local state or trigger a refresh if needed
      router.refresh();
    },
    onError() {
      setUploading(false);
      toast.error("Failed to upload image");
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Create FormData to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Execute the upload action
    execute(formData);
  };

  return (
    <div
      className={cn(
        uploading ? "opacity-70 pointer-events-none w-fit animate-pulse" : ""
      )}
    >
      <UserImageForm user={user} onFileUpload={handleFileUpload} />
    </div>
  );
}
