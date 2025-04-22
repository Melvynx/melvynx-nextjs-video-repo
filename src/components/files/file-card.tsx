/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Item, ItemType } from "@/lib/generated/client";
import { useMutation } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import {
  DollarSignIcon,
  FileAudioIcon,
  FileIcon,
  FileTextIcon,
  FilmIcon,
  ImageIcon,
  LockIcon,
  MoreVerticalIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteItem } from "../../../app/(manage)/files/file.action";

const FileTypeIcon = ({ type }: { type: ItemType }) => {
  switch (type) {
    case "VIDEO":
      return <FilmIcon className="h-4 w-4" />;
    case "AUDIO":
      return <FileAudioIcon className="h-4 w-4" />;
    case "PDF":
      return <FileIcon className="h-4 w-4" />;
    case "DOCUMENT":
      return <FileTextIcon className="h-4 w-4" />;
    case "IMAGE":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <FileIcon className="h-4 w-4" />;
  }
};

interface FileCardProps {
  file: Item;
}

export function FileCard({ file }: FileCardProps) {
  const router = useRouter();
  const isImage = file.type === "IMAGE";

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteItem({ id });

      if (!result?.data) {
        throw new Error("Failed to delete file");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    },
  });

  const handleEdit = () => {
    router.push(`/files/${file.id}`);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all py-0">
      <CardContent className="p-0">
        <div className="flex items-center">
          {isImage && file.fileUrl ? (
            <div className="relative h-12 w-16 flex-shrink-0">
              <img
                src={file.fileUrl}
                alt={file.name}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-12 w-16 bg-muted flex-shrink-0">
              <FileTypeIcon type={file.type} />
            </div>
          )}

          <div className="flex-1 p-3 min-w-0">
            <Link
              href={`/files/${file.id}`}
              className="block font-medium text-sm truncate hover:underline"
            >
              {file.name}
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground truncate">
                {file.createdAt &&
                  formatDistance(new Date(file.createdAt), new Date(), {
                    addSuffix: true,
                  })}
              </span>
              <div className="flex items-center gap-2">
                {file.password && (
                  <LockIcon className="h-3 w-3 text-muted-foreground" />
                )}
                {file.price && (
                  <DollarSignIcon className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <div className="pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVerticalIcon className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  variant="destructive"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
