import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// USER FUNCTIONS
// ============================================================

// Get a user by their ID (includes follower/following counts)
export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

// Get a user by their email (used for login)
export async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

// Get a user by their username
export async function getUserByUsername(username) {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      profilePicture: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });
}

// Create a new user (used in register)
export async function createUser({ username, email, password }) {
  return await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

// Update a user's profile (bio and/or profile picture)
export async function updateUserProfile(id, { username, bio, profilePicture }) {
  return await prisma.user.update({
    where: { id },
    data: {
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
      ...(profilePicture !== undefined && { profilePicture }),
    },
    select: {
      id: true,
      username: true,
      bio: true,
      profilePicture: true,
    },
  });
}

// Get all users (used for suggested users)
export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      profilePicture: true,
      _count: {
        select: { followers: true },
      },
    },
  });
}

// Search users by username
export async function searchUsers(query) {
  return await prisma.user.findMany({
    where: {
      username: {
        contains: query,
      },
    },
    select: {
      id: true,
      username: true,
      profilePicture: true,
    },
  });
}

// ============================================================
// FOLLOW FUNCTIONS
// ============================================================

// Get all followers of a user
export async function getFollowers(userId) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });
  return follows.map((f) => f.follower);
}

// Get all users that a user is following
export async function getFollowing(userId) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      following: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });
  return follows.map((f) => f.following);
}

// Check if a user is following another user
export async function isFollowing(followerId, followingId) {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
  return follow !== null;
}

// Follow a user
export async function followUser(followerId, followingId) {
  return await prisma.follow.create({
    data: { followerId, followingId },
  });
}

// Unfollow a user
export async function unfollowUser(followerId, followingId) {
  return await prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
}

// ============================================================
// POST FUNCTIONS
// ============================================================

// Get all posts for the feed (posts from followed users + own posts)
export async function getFeedPosts(userId) {
  // Get the list of users that the current user follows
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);
  followingIds.push(userId); // include own posts

  return await prisma.post.findMany({
    where: {
      authorId: { in: followingIds },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

// Get all posts by a specific user (for profile page)
export async function getPostsByUser(userId) {
  return await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

// Get a single post by ID (with comments and likes)
export async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      image: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      comments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
        },
      },
      likes: {
        select: { userId: true },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

// Create a new post
export async function createPost({ authorId, content, image }) {
  return await prisma.post.create({
    data: {
      authorId,
      content,
      ...(image && { image }),
    },
  });
}

// Delete a post (only by its owner)
export async function deletePost(postId, userId) {
  return await prisma.post.delete({
    where: { id: postId, authorId: userId },
  });
}

// ============================================================
// LIKE FUNCTIONS
// ============================================================

// Like a post
export async function likePost(userId, postId) {
  return await prisma.like.create({
    data: { userId, postId },
  });
}

// Unlike a post
export async function unlikePost(userId, postId) {
  return await prisma.like.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });
}

// Check if a user has liked a post
export async function hasLiked(userId, postId) {
  const like = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });
  return like !== null;
}

// ============================================================
// COMMENT FUNCTIONS
// ============================================================

// Add a comment to a post
export async function addComment({ userId, postId, text }) {
  return await prisma.comment.create({
    data: { userId, postId, text },
    select: {
      id: true,
      text: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });
}

// Delete a comment (only by its owner)
export async function deleteComment(commentId, userId) {
  return await prisma.comment.delete({
    where: { id: commentId, userId },
  });
}

// Get all comments for a post
export async function getCommentsByPost(postId) {
  return await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      text: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });
}

// ============================================================
// STATS FUNCTIONS (for Student 1's /api/stats)
// ============================================================

// Average number of followers per user
export async function getAvgFollowersPerUser() {
  const result = await prisma.follow.groupBy({
    by: ["followingId"],
    _count: { followerId: true },
  });
  if (result.length === 0) return 0;
  const total = result.reduce((sum, r) => sum + r._count.followerId, 0);
  return (total / result.length).toFixed(2);
}

// Average number of posts per user
export async function getAvgPostsPerUser() {
  const result = await prisma.post.groupBy({
    by: ["authorId"],
    _count: { id: true },
  });
  if (result.length === 0) return 0;
  const total = result.reduce((sum, r) => sum + r._count.id, 0);
  return (total / result.length).toFixed(2);
}

// Most active user (most posts) in the last 3 months
export async function getMostActiveUser() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const result = await prisma.post.groupBy({
    by: ["authorId"],
    where: { createdAt: { gte: threeMonthsAgo } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  if (result.length === 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: result[0].authorId },
    select: { id: true, username: true },
  });

  return { user, postCount: result[0]._count.id };
}

export default prisma;