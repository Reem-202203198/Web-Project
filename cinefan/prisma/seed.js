import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const fatima = await prisma.user.create({
    data: {
      username: "fatima",
      email: "fatima@test.com",
      password: "123456",
      bio: "Movie lover",
    },
  });

  const reem = await prisma.user.create({
    data: {
      username: "reem",
      email: "reem@test.com",
      password: "123456",
      bio: "Cinema fan",
    },
  });

  const post1 = await prisma.post.create({
    data: {
      content: "I loved this movie!",
      authorId: fatima.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: "Best cinema experience.",
      authorId: reem.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: "Nice post!",
      userId: haya.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: haya.id,
      postId: post1.id,
    },
  });

  console.log("Seed done");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });