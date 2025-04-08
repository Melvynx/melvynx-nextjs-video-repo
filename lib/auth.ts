import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins/magic-link";
import { AC_CONTROL, AC_ROLES } from "./auth-permissions";
import { prisma } from "./prisma";
import { resend } from "./resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.organization.create({
            data: {
              id: crypto.randomUUID(),
              createdAt: new Date(),
              name: user.email.split("@")[0] + "'s org",
              slug: user.email.split("@")[0].replaceAll(".", ""),
              members: {
                create: {
                  id: crypto.randomUUID(),
                  createdAt: new Date(),
                  role: "owner",
                  userId: user.id,
                },
              },
            },
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
    organization({
      organizationLimit: 1,
      membershipLimit: 5,
      ac: AC_CONTROL,
      roles: AC_ROLES,
      async sendInvitationEmail(data) {
        const inviteLink = `http://localhost:3000/accept-invitation/${data.id}`;
        const res = await resend.emails.send({
          to: data.email,
          from: "nextfullstack@nowts.app",
          subject: "Invitation",
          text: `Hello, click here : ${inviteLink}`,
        });
        console.log(res);
      },
    }),
    nextCookies(),
  ],
});
