import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { notFound } from "next/navigation";
import { StripeConnectEmbed } from "./stripe-connect-embed";

export default async function RoutePage() {
  const user = await getRequiredUser();

  const { stripeAccountId } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { stripeAccountId: true },
  });

  if (!stripeAccountId) notFound();

  const accountSession = await stripe.accountSessions.create({
    account: stripeAccountId,
    components: {
      balances: {
        enabled: true,
      },
      payments: {
        enabled: true,
      },
    },
  });

  const clientSecret = accountSession.client_secret;

  return <StripeConnectEmbed clientSecret={clientSecret} />;
}
