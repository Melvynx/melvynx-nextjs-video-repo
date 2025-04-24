import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { imageUserUploadAction } from "./user-image-upload.action";

export type UserImageFormProps = {
  imageUrl?: string | null;
  name: string;
};

export const UserImageForm = (props: UserImageFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClick = async () => {
    fileInputRef.current?.click();
  };

  const uploadImage = useAction(imageUserUploadAction, {
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // upload
    console.log(file);
    uploadImage.execute(formData);
  };

  return (
    <div
      className={cn("relative group overflow-hidden rounded-full", {
        "animate-pulse": uploadImage.isPending,
      })}
    >
      <Avatar className="size-12">
        <AvatarFallback>{props.name.charAt(0)}</AvatarFallback>
        {props.imageUrl ? <AvatarImage src={props.imageUrl} /> : null}
      </Avatar>
      <button
        onClick={handleClick}
        className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300 bg-black/50"
      >
        <span className="text-white text-xs">Upload</span>
      </button>
      <input
        onChange={handleChange}
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};
