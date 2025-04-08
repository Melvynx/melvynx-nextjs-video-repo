import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "./auth-button";
import { Skeleton } from "./ui/skeleton";

export const Header = async () => {
  return (
    <header className="px-4 py-2 border-b flex items-center gap-2">
      <Link href="/">App</Link>
      <Link href="/orgs/test">Orgs</Link>
      <div className="flex-1"></div>
      <Suspense fallback={<Skeleton className="w-10 h-10" />}>
        <AuthButton />
      </Suspense>
    </header>
  );
};
