import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserOrganization } from "@/lib/auth-session";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { OrgSelector } from "./org-selector";

export default async function RouteLayout(props: {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const params = await props.params;
  const orgSlug = params.orgSlug;

  const org = await getUserOrganization();

  if (!org) {
    const orgs = await auth.api.listOrganizations({
      headers: await headers(),
    });

    return (
      <div className="flex h-screen flex-col">
        <main className="flex-1 overflow-y-auto p-6">
          <h2>Choose organization</h2>
          {orgs.map((org) => (
            <form key={org.id}>
              <Button
                formAction={async () => {
                  "use server";

                  await auth.api.setActiveOrganization({
                    headers: await headers(),
                    body: {
                      organizationId: org.id,
                    },
                  });

                  redirect(`/orgs/${org.slug}`);
                }}
              >
                {org.name}
              </Button>
            </form>
          ))}
        </main>
      </div>
    );
  }

  if (org.slug !== params.orgSlug) {
    redirect(`/orgs/${org.slug}`);
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-4 py-2 pt-0 flex items-center gap-2">
        <OrgSelector currentOrgSlug={params.orgSlug} />
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
        <Link
          className="text-indigo-500 hover:underline text-sm"
          href={`/orgs/${orgSlug}/posts`}
        >
          Posts
        </Link>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{props.children}</main>
    </div>
  );
}
