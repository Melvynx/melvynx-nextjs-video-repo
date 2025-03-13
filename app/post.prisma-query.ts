import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const POSTS_SELECT = {
  slug: true,
  id: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  content: true,
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostSelect;

export const getPosts = async () => {
  const post = prisma.post.findMany({
    select: POSTS_SELECT,
  });
  return post;
};

export const getPost = async (postSlug: string) => {
  const post = prisma.post.findUnique({
    where: {
      slug: postSlug,
    },
    select: {
      ...POSTS_SELECT,
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  return post;
};

export type PostListType = Prisma.PromiseReturnType<typeof getPosts>;
