"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "better-auth";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

interface UserImageFormProps {
  user: User;
  onFileUpload: (file: File) => void;
}

export function UserImageForm({ user, onFileUpload }: UserImageFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative group cursor-pointer ${
        dragActive ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Avatar className="size-12 transition-transform hover:scale-105">
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        {user.image ? (
          <AvatarImage src={user.image} alt={user.name || "User"} />
        ) : null}
      </Avatar>
      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <span className="text-white text-xs">Upload</span>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}

export default UserImageForm;
