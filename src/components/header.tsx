import { getUser } from "@/lib/auth-session";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./logout";
import { Button, buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Header = async () => {
  const user = await getUser();

  return (
    <header className="px-4 py-2 border-b flex items-center gap-2">
      <Link
        href="/"
        className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
      >
        NextDrop.io
      </Link>
      <Link
        href="/files"
        className="text-sm text-indigo-500 underline hover:text-indigo-600"
      >
        Upload files
      </Link>
      {user?.plan === "FREE" ? (
        <Link
          href="/pricing"
          className="text-sm text-indigo-500 underline hover:text-indigo-600"
        >
          Upgrade to PRO
        </Link>
      ) : null}
      <div className="flex-1"></div>
      {user?.plan === "IRON" ? (
        <Image
          src="/plan/PLAN_IRON.png"
          width={32}
          height={32}
          alt="iron plan icon"
        />
      ) : null}
      {user?.plan === "GOLD" ? (
        <Image
          src="/plan/PLAN_GOLD.png"
          width={32}
          height={32}
          alt="iron plan icon"
        />
      ) : null}
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">{user.name || user.email}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/auth">Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          className={buttonVariants({ size: "sm", variant: "outline" })}
          href="/auth/signin"
        >
          SignIn
        </Link>
      )}
    </header>
  );
};
