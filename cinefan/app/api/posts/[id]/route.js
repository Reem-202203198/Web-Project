import { getPostById, deletePost } from '@/lib/repository';

export async function GET(request, { params }) {
  const post = await getPostById(params.id);
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(post);
}

export async function DELETE(request, { params }) {
  const { userId } = await request.json();
  await deletePost(params.id, userId);
  return Response.json({ success: true });
}