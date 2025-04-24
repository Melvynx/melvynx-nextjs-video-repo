import CommentsList from "@/components/comments-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.image ?? undefined} />
              <AvatarFallback>
                {post.user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </CardTitle>
          <CardDescription>{post.comments.length} comments</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4 text-gray-700 dark:text-gray-300">
              {paragraph}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Comments ({post.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommentsList postId={post.id} initialComments={post.comments} />
        </CardContent>
      </Card>
    </div>
  );
}
