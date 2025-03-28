import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PostListType } from "./post.prisma-query";

export const PostCard = (props: { post: PostListType }) => {
  const post = props.post;
  return (
    <Link
      href={`/posts/${post.slug}`}
      key={post.slug}
      className="block hover:shadow-lg transition-shadow duration-300"
    >
      <Card className="h-full border dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            {post.title} {post.id}
          </CardTitle>
          <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
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
  );
};
