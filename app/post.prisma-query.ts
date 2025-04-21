import { Prisma } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";

const SELECT_POST_QUERY = {
  slug: true,
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostSelect;

export const getPosts = () => {
  return prisma.post.findMany({
    select: SELECT_POST_QUERY,
  });
};

export type PostListType = Prisma.PromiseReturnType<typeof getPosts>[number];

export const getPost = (slug: string) => {
  return prisma.post.findUnique({
    where: {
      slug,
    },
    select: {
      ...SELECT_POST_QUERY,
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
};
