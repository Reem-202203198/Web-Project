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
      posts: { _count: "desc" },
    },
    include: {
      _count: { select: { posts: true } },
    },
  });
}

export async function getMostLikedPost() {
  return await prisma.post.findFirst({
    orderBy: {
      likes: { _count: "desc" },
    },
    include: {
      author: true,
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getAvgPostsPerUser() {
  const [totalPosts, totalUsers] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
  ]);
  return totalUsers > 0 ? (totalPosts / totalUsers).toFixed(2) : 0;
}

export async function getTopFollowedUsers() {
  return await prisma.user.findMany({
    take: 5,
    orderBy: {
      followers: { _count: "desc" },
    },
    include: {
      _count: { select: { followers: true } },
    },
  });
}