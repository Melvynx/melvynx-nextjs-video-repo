import { getPost } from "@/app/post.prisma-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const post = await getPost(slug);

  if (!post) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
      <Link
        href="/"
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4"
      >
        <svg
          className="mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
        Back to posts
      </Link>

      <Card className="border dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Posted on {new Date(post.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Comments ({post.comments.length})
        </h2>

        <div className="space-y-4 mb-8">
          {post.comments.map((comment) => (
            <Card key={comment.id} className="border dark:bg-gray-800/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                    {comment.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-gray-700 dark:text-gray-300">
                {comment.content}
              </CardContent>
            </Card>
          ))}

          {post.comments.length === 0 && (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>

        <Card className="border dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Leave a comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";

                const name = formData.get("name") as string;
                const content = formData.get("content") as string;

                await prisma.comment.create({
                  data: {
                    name: name || undefined,
                    content,
                    postId: post.id,
                  },
                });

                revalidatePath(`/posts/${post.slug}`);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Name (optional)
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Comment
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your comment here..."
                  className="w-full min-h-[120px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Post Comment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
