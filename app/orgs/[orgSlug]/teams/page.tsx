export type Member = {
  id: string;
  user: {
    email: string;
    name: string;
    image?: string | null;
  };
  userId: string;
  role: string;
};

export type Invitation = {
  id: string;
  email: string;
  organizationId: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  inviterId: string;
};

import { getUserOrganization } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TeamsForm } from "./teams-form";

export default async function RoutePage() {
  const org = await getUserOrganization();

  if (!org) notFound();

  const members: Member[] = org.members ?? [];

  const invitations: Invitation[] = await prisma.invitation.findMany({
    where: {
      organizationId: org.id,
    },
  });

  return (
    <div className="p-4">
      <TeamsForm members={members} invitations={invitations} maxMembers={5} />
    </div>
  );
}
