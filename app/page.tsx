import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const [posts, countPost] = [[], 0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Latest Posts ({countPost})
      </h1>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            href={`/posts/${post.slug}`}
            key={post.id}
            className="block hover:shadow-lg transition-shadow duration-300"
          >
            <Card className="h-full border dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  {post.title}
                </CardTitle>
                <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{post._count.comments} comments</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {post.content.substring(0, 150)}...
              </CardContent>
              <CardFooter className="justify-end">
                <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Read more
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts found. Check back later!</p>
        </div>
      )}
    </div>
  );
}
