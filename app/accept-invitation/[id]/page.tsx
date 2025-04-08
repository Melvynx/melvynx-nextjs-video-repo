import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function RoutePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await getUser();
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: params.id,
    },
    include: {
      organization: true,
    },
  });

  if (!invitation) notFound();

  if (!user) {
    return (
      <Alert>
        <AlertTitle>Please create an account</AlertTitle>
        <AlertDescription>Using e-mail {invitation.email}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        Accept invitation {invitation.organization.name} ?
      </CardHeader>
      <CardFooter>
        <form>
          <Button
            formAction={async () => {
              "use server";
              await auth.api.acceptInvitation({
                headers: await headers(),
                body: {
                  invitationId: params.id,
                },
              });
              redirect(`/orgs/${invitation.organization.slug}`);
            }}
          >
            Yes
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
