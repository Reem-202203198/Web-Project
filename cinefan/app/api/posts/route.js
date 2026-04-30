import { getFeedPosts, createPost } from '@/lib/repository';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const posts = await getFeedPosts(userId);
  return Response.json(posts);
}

export async function POST(request) {
  const { userId, content, image } = await request.json();
  if (!content?.trim())
    return Response.json({ error: 'Content required' }, { status: 400 });
  const post = await createPost({ authorId: userId, content, image });
  return Response.json(post, { status: 201 });
}