import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export const GET = async () => {
  await signOut();

  return NextResponse.redirect("http://localhost:3000/auth/signin");
};
