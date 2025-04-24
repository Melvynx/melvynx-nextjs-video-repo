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
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const [posts, countPost] = await prisma.$transaction([
    prisma.post.findMany({
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
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
      take: 6,
    }),
    prisma.post.count(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Latest Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover the latest {countPost} posts from our community
          </p>
        </div>
        <Button asChild>
          <Link href="/posts/create">Create post</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            href={`/posts/${post.slug}`}
            key={post.id}
            className="block group"
          >
            <Card className="h-full border dark:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:border-primary">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.user.image ?? undefined} />
                      <AvatarFallback>
                        {post.user.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.user.name}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {post.content}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {post._count.comments} comments
                </div>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                  Read more
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              No posts found. Be the first to create one!
            </p>
            <Button className="mt-4" asChild>
              <Link href="/posts/create">Create your first post</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {posts.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/posts">View all {countPost} posts</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
