import { PrismaClient } from "@/lib/generated/client";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Number of records to create
const NUM_USERS = 10;
const POSTS_PER_USER = 3;
const COMMENTS_PER_POST = 5;

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleared existing data");

  // Create users
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        emailVerified: faker.datatype.boolean(0.9), // 90% chance of being verified
        image: faker.image.avatar(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        accounts: {
          create: {
            id: randomUUID(),
            accountId: randomUUID(),
            providerId: "credentials",
            password: faker.internet.password(),
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
          },
        },
      },
    });
    users.push(user);
    console.log(`👤 Created user: ${user.name}`);
  }

  // Create posts for each user
  for (const user of users) {
    for (let i = 0; i < POSTS_PER_USER; i++) {
      const title = faker.lorem.sentence({ min: 4, max: 8 });
      const slug = faker.helpers.slugify(title).toLowerCase();

      const post = await prisma.post.create({
        data: {
          title,
          slug: `${slug}-${faker.string.alphanumeric(6)}`, // Ensure uniqueness
          content: faker.lorem.paragraphs({ min: 3, max: 7 }),
          userId: user.id,
          createdAt: faker.date.recent(),
        },
      });
      console.log(`📝 Created post: ${post.title}`);

      // Create comments for each post
      const commenters = faker.helpers.arrayElements(
        users,
        faker.number.int({ min: 1, max: COMMENTS_PER_POST })
      );
      for (const commenter of commenters) {
        const comment = await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            postId: post.id,
            userId: commenter.id,
            createdAt: faker.date.recent(),
          },
        });
        console.log(
          `💬 Created comment #${comment.id} by ${
            commenter.name
          } on post: ${post.title.substring(0, 20)}...`
        );
      }
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
