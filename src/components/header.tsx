import { getUser } from "@/lib/auth-session";
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

  console.log(user);

  return (
    <header className="px-4 py-2 border-b flex items-center gap-2">
      <Link href="/">App</Link>
      <div className="flex-1"></div>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
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
