import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Total Users
export async function getTotalUsers() {
  return await prisma.user.count();
}

// 2. Total Posts
export async function getTotalPosts() {
  return await prisma.post.count();
}

// 3. Total Comments
export async function getTotalComments() {
  return await prisma.comment.count();
}

// 4. Total Likes
export async function getTotalLikes() {
  return await prisma.like.count();
}

// 5. Most Active User
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

// 6. Most Liked Post
export async function getMostLikedPost() {
  return await prisma.post.findFirst({
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
    include: {
      likes: true,
      user: true,
    },
  });
}