import { UserPlan } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PRICES } from "../../../(manage)/pricing/price.data";

export const POST = async (req: NextRequest) => {
  const headerList = await headers();
  const body = await req.text();

  const stripeSignature = headerList.get("stripe-signature");

  let event: Stripe.Event | null = null;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      stripeSignature ?? "",
      process.env.STRIPE_WEBHOOKS_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object;
      const customer = checkoutSession.customer as string;
      const metadata = checkoutSession.metadata;
      const plan = metadata?.plan;

      console.log({ plan, customer });

      if (!plan) throw new Error("Invalid plan");

      await prisma.user.update({
        where: {
          stripeCustomerId: customer,
        },
        data: {
          plan: plan as UserPlan,
        },
      });
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const customer = subscription.customer as string;
      const priceId = subscription.items.data[0].price.id;

      const currentPlan = PRICES.find(
        (price) =>
          price.monthlyPriceId === priceId || price.yearlyPriceId === priceId
      );

      const isActive = subscription.status === "active";

      if (currentPlan && isActive) {
        await prisma.user.update({
          where: {
            stripeCustomerId: customer,
          },
          data: {
            plan: currentPlan.id as UserPlan,
          },
        });
      }

      if (!isActive) {
        await prisma.user.update({
          where: {
            stripeCustomerId: customer,
          },
          data: {
            plan: "BRONZE",
          },
        });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customer = subscription.customer as string;

      const isActive = subscription.status === "active";

      if (!isActive) {
        await prisma.user.update({
          where: {
            stripeCustomerId: customer,
          },
          data: {
            plan: "BRONZE",
          },
        });
      }
    } else {
      console.log(`Unhandled event type ${event.type}`);
    }
  } catch {
    console.error("Error");
  }

  return NextResponse.json({ received: true }, { status: 200 });
};
