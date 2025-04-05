import { getSession } from "@/lib/auth";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function Header() {
  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b">
      <Link href="/">Home</Link>
      <div className="flex-1" />
      <Authbutton />
    </header>
  );
}

export async function Authbutton() {
  const session = await getSession();

  if (!session?.user) {
    return (
      <Link
        className={buttonVariants({ size: "sm", variant: "outline" })}
        href="/auth/signin"
      >
        Sign In
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2">
      {session.user.email}
      <Link
        className={buttonVariants({ size: "sm", variant: "outline" })}
        href="/api/auth/signout"
      >
        Sign Out
      </Link>
    </span>
  );
}
