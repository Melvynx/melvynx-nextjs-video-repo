"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCommentAction } from "./server.action";

type Post = {
  id: number;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    image: string | null;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    userId: string;
    user: {
      name: string;
      image: string | null;
    };
  }[];
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { data } = useSession();

  const user = data?.user;

  const router = useRouter();

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleComment: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const postId = form.getAttribute("data-post-id");
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: formData.get("comment"),
        }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      toast.success("Comment added!");

      form.reset();
      fetchPosts();
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted!");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    const { data, error } = await deleteCommentAction(commentId);

    if (error) {
      toast.error(error);
      return;
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter((c) => c.id !== data?.commentId),
          };
        }
        return post;
      })
    );
    toast.success("Comment deleted!");
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Please sign in to view posts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => router.push("/posts/create")}>Create Post</Button>

      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {post.title} {post.id}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar>
                      <AvatarImage src={post.user.image ?? undefined} />
                      <AvatarFallback>
                        {post.user.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.user.name}</span>
                  </div>
                </CardDescription>
              </div>
              {user.id === post.userId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <form
              className="w-full space-y-2"
              onSubmit={handleComment}
              data-post-id={post.id}
            >
              <Label htmlFor={`comment-${post.id}`}>Add a comment</Label>
              <div className="flex gap-2">
                <Input
                  id={`comment-${post.id}`}
                  name="comment"
                  placeholder="Write a comment..."
                  required
                />
                <Button type="submit">Send</Button>
              </div>
            </form>

            <div className="w-full space-y-4">
              {post.comments.map((comment) => (
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
                      <p className="text-sm font-medium">
                        {comment.user.name} {comment.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  {user.id === comment.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(post.id, comment.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
