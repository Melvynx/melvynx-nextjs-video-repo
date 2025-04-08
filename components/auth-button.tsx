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

export const AuthButton = async () => {
  const user = await getUser();

  if (user) {
    return (
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
    );
  }

  return (
    <Link
      className={buttonVariants({ size: "sm", variant: "outline" })}
      href="/auth/signin"
    >
      SignIn
    </Link>
  );
};
