import Link from "next/link";
import type { ReactNode } from "react";
import { OrgSelector } from "./org-selector";

export default async function RouteLayout(props: {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const params = await props.params;
  const orgSlug = params.orgSlug;
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-4 py-2 pt-0 flex items-center gap-2">
        <OrgSelector />
        <Link
          className="text-indigo-500 hover:underline text-sm"
          href={`/orgs/${orgSlug}`}
        >
          Home
        </Link>
        <Link
          className="text-indigo-500 hover:underline text-sm"
          href={`/orgs/${orgSlug}/teams`}
        >
          Teams
        </Link>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
    </div>
  );
}
