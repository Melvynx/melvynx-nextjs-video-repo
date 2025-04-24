"use client";

import { deleteCommentAction } from "@/app/posts/server.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FormEventHandler } from "react";
import { toast } from "sonner";

type Comment = {
  id: number;
  content: string;
  createdAt: Date;
  userId: string;
  user: {
    name: string;
    image: string | null;
  };
};

interface CommentsListProps {
  postId: number;
  initialComments: Comment[];
}

export default function CommentsList({
  postId,
  initialComments,
}: CommentsListProps) {
  const comments = initialComments;
  const { data } = useSession();
  const user = data?.user;
  const router = useRouter();

  const handleComment: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get("comment") as string;

    if (!content || content.trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to add comment");
      }

      router.refresh();
      toast.success("Comment added!");
      form.reset();
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const { error } = await deleteCommentAction(commentId);

      if (error) {
        toast.error(error);
        return;
      }

      router.refresh();
      toast.success("Comment deleted!");
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {user ? (
        <form className="space-y-2" onSubmit={handleComment}>
          <Label htmlFor="comment">Add a comment</Label>
          <div className="flex gap-2">
            <Input
              id="comment"
              name="comment"
              placeholder="Write a comment..."
              required
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please sign in to comment
        </p>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-muted p-3"
            >
              <div className="flex gap-2">
                <Avatar>
                  <AvatarImage src={comment.user.image ?? undefined} />
                  <AvatarFallback>
                    {comment.user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
              {user && user.id === comment.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}
