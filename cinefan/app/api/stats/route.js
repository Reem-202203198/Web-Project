import {
  getTotalUsers,
  getTotalPosts,
  getTotalComments,
  getTotalLikes,
  getMostActiveUser,
  getMostLikedPost,
  getAvgPostsPerUser,
  getTopFollowedUsers,
} from "@/lib/statsQueries";

export async function GET() {
  try {
    const stats = {
      totalUsers: await getTotalUsers(),
      totalPosts: await getTotalPosts(),
      totalComments: await getTotalComments(),
      totalLikes: await getTotalLikes(),
      mostActiveUser: await getMostActiveUser(),
      mostLikedPost: await getMostLikedPost(),
      avgPostsPerUser: await getAvgPostsPerUser(),
      topFollowedUsers: await getTopFollowedUsers(),
    };

    return Response.json(stats);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}