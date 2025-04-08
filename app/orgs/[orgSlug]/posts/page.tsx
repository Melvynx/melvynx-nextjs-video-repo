import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getUserOrganization, hasPermission } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export default async function RoutePage() {
  const org = await getUserOrganization();

  if (!org) notFound();

  const posts = await prisma.post.findMany({
    where: {
      organizationId: org.id,
    },
    include: {
      user: true,
    },
  });

  const canDelete = await hasPermission({
    posts: ["delete"],
  });
  return (
    <div className="flex flex-col gap-4">
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
              {canDelete ? (
                <form>
                  <Button
                    formAction={async () => {
                      "use server";

                      if (
                        !(await hasPermission({
                          posts: ["delete"],
                        }))
                      )
                        return;

                      await prisma.post.delete({
                        where: {
                          id: post.id,
                        },
                      });
                      revalidatePath(`/orgs/${org.slug}/posts`);
                    }}
                  >
                    Delete
                  </Button>
                </form>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>Create post</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";

              if (
                !(await hasPermission({
                  posts: ["create"],
                }))
              )
                throw new Error("Invalid permission");

              const title = formData.get("title") as string;
              const content = formData.get("content") as string;
              const slug = formData.get("slug") as string;

              if (!org.id || !org.user.id) throw new Error("invalid");

              await prisma.post.create({
                data: {
                  title,
                  content,
                  slug,
                  organizationId: org.id,
                  userId: org.user.id,
                },
              });

              revalidatePath(`/orgs/${org.slug}/posts`);
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug
                  <span className="text-xs text-muted-foreground ml-2">
                    (URL-friendly version of the title)
                  </span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="url-friendly-title"
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens are allowed"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your post content..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="submit">Create Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
