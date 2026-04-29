import { addComment } from '@/lib/repository';

export async function POST(request, { params }) {
  try {
    const { userId, text } = await request.json();

    if (!text || !text.trim()) {
      return Response.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    const comment = await addComment({ userId, postId: params.id, text: text.trim() });
    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment error:', error);
    return Response.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}