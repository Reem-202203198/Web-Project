import { getPostById, deletePost } from '@/lib/repository';

export async function GET(request, { params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(post);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await deletePost(id);
  return Response.json({ success: true });
}