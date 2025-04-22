import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { prisma } from "./prisma";
import { resend } from "./resend";
import { stripe } from "./stripe";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
          });
          const account = await stripe.accounts.create();

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              stripeCustomerId: customer.id,
              stripeAccountId: account.id,
            },
          });
        },
      },
      update: {
        after: async (user) => {
          const { stripeCustomerId } = await prisma.user.findUniqueOrThrow({
            where: {
              id: user.id,
            },
            select: {
              stripeCustomerId: true,
            },
          });

          if (!stripeCustomerId) return;

          await stripe.customers.update(stripeCustomerId, {
            email: user.email,
            name: user.name,
          });
        },
      },
    },
  },
  appName: "prisma-auth-app",
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        from: "nextfullstack@nowts.app",
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          to: email,
          from: "nextfullstack@nowts.app",
          subject: "Magic Link",
          text: `Hello, click here : ${url}`,
        });
      },
    }),
    nextCookies(),
  ],
});
