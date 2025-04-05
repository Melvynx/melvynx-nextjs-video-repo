import { COOKIE_KEY, saveSession, signUp } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const json = await req.json();

  const { email, password } = json;

  try {
    const newUser = await signUp(email, password);

    const session = await saveSession(newUser.id);

    const cookiesList = await cookies();
    cookiesList.set(COOKIE_KEY, session.token);

    revalidatePath("/", "layout");

    return NextResponse.json({ user: newUser });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Unknown error",
    });
  }
};
