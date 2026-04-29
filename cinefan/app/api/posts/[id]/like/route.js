import { hasLiked, likePost, unlikePost } from '@/lib/repository';

export async function POST(request, { params }) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const alreadyLiked = await hasLiked(userId, params.id);

    if (alreadyLiked) {
      await unlikePost(userId, params.id);
      return Response.json({ liked: false });
    } else {
      await likePost(userId, params.id);
      return Response.json({ liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    return Response.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}