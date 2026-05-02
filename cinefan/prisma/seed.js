import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const fatima = await prisma.user.create({
    data: { username: "fatima", email: "fatima@test.com", password: "123456", bio: "Movie lover" },
  });
  const reem = await prisma.user.create({
    data: { username: "reem", email: "reem@test.com", password: "123456", bio: "Cinema fan" },
  });
  const haya = await prisma.user.create({
    data: { username: "haya", email: "haya@test.com", password: "123456", bio: "Film critic" },
  });
  const sara = await prisma.user.create({
    data: { username: "sara", email: "sara@test.com", password: "123456", bio: "Series addict" },
  });
  const noor = await prisma.user.create({
    data: { username: "noor", email: "noor@test.com", password: "123456", bio: "Anime fan" },
  });

  // Create posts
  const post1 = await prisma.post.create({ data: { content: "I loved this movie!", authorId: fatima.id } });
  const post2 = await prisma.post.create({ data: { content: "Best cinema experience ever.", authorId: fatima.id } });
  const post3 = await prisma.post.create({ data: { content: "The new Marvel film was amazing!", authorId: fatima.id } });
  const post4 = await prisma.post.create({ data: { content: "Inception is a masterpiece.", authorId: reem.id } });
  const post5 = await prisma.post.create({ data: { content: "Just watched Dune Part 2!", authorId: reem.id } });
  const post6 = await prisma.post.create({ data: { content: "Top Gun Maverick never gets old.", authorId: haya.id } });
  const post7 = await prisma.post.create({ data: { content: "Parasite deserved every award.", authorId: sara.id } });
  const post8 = await prisma.post.create({ data: { content: "Attack on Titan final season review.", authorId: noor.id } });

  // Create comments
  await prisma.comment.create({ data: { text: "Totally agree!", userId: reem.id, postId: post1.id } });
  await prisma.comment.create({ data: { text: "Same here!", userId: haya.id, postId: post1.id } });
  await prisma.comment.create({ data: { text: "Nice post!", userId: sara.id, postId: post2.id } });
  await prisma.comment.create({ data: { text: "Marvel fan here too!", userId: noor.id, postId: post3.id } });
  await prisma.comment.create({ data: { text: "Inception is my fav!", userId: fatima.id, postId: post4.id } });
  await prisma.comment.create({ data: { text: "Dune was breathtaking.", userId: haya.id, postId: post5.id } });

  // Create likes
  await prisma.like.create({ data: { userId: reem.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: haya.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: sara.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: noor.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: fatima.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: sara.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: noor.id, postId: post5.id } });
  await prisma.like.create({ data: { userId: fatima.id, postId: post6.id } });

  // Create follows
  await prisma.follow.create({ data: { followerId: reem.id, followingId: fatima.id } });
  await prisma.follow.create({ data: { followerId: haya.id, followingId: fatima.id } });
  await prisma.follow.create({ data: { followerId: sara.id, followingId: fatima.id } });
  await prisma.follow.create({ data: { followerId: noor.id, followingId: fatima.id } });
  await prisma.follow.create({ data: { followerId: fatima.id, followingId: reem.id } });
  await prisma.follow.create({ data: { followerId: haya.id, followingId: reem.id } });
  await prisma.follow.create({ data: { followerId: sara.id, followingId: reem.id } });
  await prisma.follow.create({ data: { followerId: fatima.id, followingId: haya.id } });

  console.log("✅ Seed done!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());