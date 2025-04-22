"use client";

import { useMutation } from "@tanstack/react-query";
import { FileIcon, UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFileAction } from "./files/upload.action";

interface UploadDropzoneProps {
  onClientUploadComplete?: (res: { id: string; fileUrl: string }) => void;
  onUploadError?: (error: Error) => void;
}

export function UploadDropzone({
  onClientUploadComplete,
  onUploadError,
}: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFileAction(formData);

      if (!result?.data) {
        throw new Error("Upload failed");
      }

      return result.data;
    },
    onSuccess: (data) => {
      if (onClientUploadComplete) {
        onClientUploadComplete(data);
      }
    },
    onError: (error) => {
      if (onUploadError) {
        onUploadError(error);
      }
      toast.error("Upload failed");
    },
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const file = files[0];
    uploadMutation.mutate(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,audio/*,video/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <div className="flex flex-col items-center justify-center gap-2">
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : isDragging ? (
          <>
            <UploadIcon className="h-10 w-10 text-primary" />
            <p className="text-primary font-medium">Drop the file here</p>
          </>
        ) : (
          <>
            <FileIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Drag and drop or click to upload a file
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports PDF, audio, video, and document files
            </p>
          </>
        )}
      </div>
    </div>
  );
}
