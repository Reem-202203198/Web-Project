import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getTotalUsers() {
  return await prisma.user.count();
}

export async function getTotalPosts() {
  return await prisma.post.count();
}

export async function getTotalComments() {
  return await prisma.comment.count();
}

export async function getTotalLikes() {
  return await prisma.like.count();
}

export async function getMostActiveUser() {
  return await prisma.user.findFirst({
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    include: {
      posts: true,
    },
  });
}

export async function getMostLikedPost() {
  return await prisma.post.findFirst({
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
    include: {
      likes: true,
      author: true,
    },
  });
}