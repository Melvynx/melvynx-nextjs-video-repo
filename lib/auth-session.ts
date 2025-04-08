import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "./auth"; // path to your Better Auth server instance

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  return session;
};

export const getUser = async () => {
  const session = await getSession();

  return session?.user;
};

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) unauthorized();

  return user;
};

export const getUserOrganization = async () => {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    return null;
  }

  const organization = await auth.api.getFullOrganization({
    headers: await headers(),
    query: {
      organizationId: session.session.activeOrganizationId,
    },
  });

  return {
    ...organization,
    user: session.user,
  };
};

export type Permissions = Parameters<
  typeof auth.api.hasPermission
>[0]["body"]["permission"];

export const hasPermission = async (permission: Permissions) => {
  const result = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permission: permission,
    },
  });

  if (result.success) return true;
  return false;
};
