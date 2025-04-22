import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getRequiredUser, getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";

export default async function AuthPage() {
  const user = await getRequiredUser();
  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const sessions = await auth.api.listSessions({
    headers: await headers(),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auth</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm name={user.name} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <Button
              formAction={async () => {
                "use server";

                const currentUser = await getUser();

                if (!currentUser) throw new Error("Invalid user");
                const { stripeCustomerId } =
                  await prisma.user.findUniqueOrThrow({
                    where: { id: currentUser.id },
                    select: { stripeCustomerId: true },
                  });

                if (!stripeCustomerId) {
                  throw new Error("Invalid user");
                }

                const billingPortal =
                  await stripe.billingPortal.sessions.create({
                    customer: stripeCustomerId,
                    return_url: "http://localhost:3000/auth",
                  });

                if (!billingPortal.url) {
                  throw new Error("Invalid Billing POrtal");
                }

                redirect(billingPortal.url);
              }}
            >
              Manage Subscription
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No connected accounts</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{account.provider}</h3>
                    <span className="text-xs text-muted-foreground">
                      ID: {account.accountId}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {new Date(account.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>{" "}
                      {new Date(account.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {account.scopes.length > 0 && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-xs">
                        Scopes:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {account.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">No active sessions</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      {session.userAgent || "Unknown Device"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      IP: {session.ipAddress || "Unknown"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>{" "}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {new Date(session.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
