import { hash, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const COOKIE_KEY = "auth_session_id";

export const getSession = async () => {
  const cookieList = await cookies();
  const sessionToken = cookieList.get(COOKIE_KEY)?.value;

  const session = await prisma.session.findFirst({
    where: {
      token: sessionToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return session;
};

export const signOut = async () => {
  const session = await getSession();

  if (!session) {
    return;
  }

  await prisma.session.delete({
    where: {
      id: session?.id,
    },
  });

  const cookieList = await cookies();
  cookieList.delete(COOKIE_KEY);

  return;
};

export const hashPassword = (password: string) => {
  // process.env.BETTER_AUTH_SECRET
  return hash("sha256", password + "SALT");
};

export const signUp = async (email: string, password: string) => {
  const hPassword = hashPassword(password);

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    throw new Error("User already exist");
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash: hPassword,
    },
  });

  return newUser;
};

export const signIn = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("Invalid email/password");

  if (hashPassword(password) !== user?.passwordHash) {
    throw new Error("Invalid email/password");
  }

  return { id: user.id, email: user.email, createdAt: user.createdAt };
};

export const saveSession = async (userId: number) => {
  const token = randomUUID();

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  return session;
};
