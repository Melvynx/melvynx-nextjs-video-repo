import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PostCard } from "./post-card";
import { getPosts } from "./post.prisma-query";

export default async function Home() {
  const [posts, countPost] = [await getPosts(), await prisma.post.count()];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Latest Posts ({countPost})
      </h1>

      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No posts found. Check back later!</p>
        </div>
      )}
      <form
        action={async (formData) => {
          "use server";

          const slug = formData.get("slug") as string;
          const title = formData.get("title") as string;
          const content = formData.get("content") as string;

          await prisma.post.create({
            data: {
              slug,
              title,
              content,
            },
          });

          revalidatePath("/");
        }}
        className="flex flex-col gap-2 p-4 border rounded-md"
      >
        <p>Create post</p>
        <Input name="slug" placeholder="slug" />
        <Input name="title" placeholder="title" />
        <Textarea name="content" placeholder="content" />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
