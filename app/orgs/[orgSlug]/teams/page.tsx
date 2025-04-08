export type Member = {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
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

import { TeamsForm } from "./teams-form";

export default async function RoutePage(props: {
  params: Promise<{ orgSlug: string }>;
}) {
  const params = await props.params;
  console.log({ params });

  const members: Member[] = [
    {
      id: "1",
      user: {
        id: "u1",
        email: "john@example.com",
        name: "John Doe",
        image: null,
      },
      userId: "u1",
      role: "admin",
    },
    {
      id: "2",
      user: {
        id: "u2",
        email: "jane@example.com",
        name: "Jane Smith",
        image: "/avatars/jane.jpg",
      },
      userId: "u2",
      role: "member",
    },
    {
      id: "3",
      user: {
        id: "u3",
        email: "alex@example.com",
        name: "Alex Johnson",
        image: null,
      },
      userId: "u3",
      role: "member",
    },
  ];

  const invitations: Invitation[] = [
    {
      id: "inv1",
      email: "mark@example.com",
      organizationId: "org1",
      role: "member",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      inviterId: "u1",
    },
    {
      id: "inv2",
      email: "sarah@example.com",
      organizationId: "org1",
      role: "admin",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      inviterId: "u1",
    },
    {
      id: "inv3",
      email: "david@example.com",
      organizationId: "org1",
      role: null,
      status: "expired",
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      inviterId: "u2",
    },
  ];

  return (
    <div className="p-4">
      <TeamsForm members={members} invitations={invitations} maxMembers={5} />
    </div>
  );
}
