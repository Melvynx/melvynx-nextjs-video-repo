"use server";

import { prisma } from "@/lib/prisma";
import { userAction } from "@/lib/safe-action";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { PRICES } from "./price.data";

export const upgradePlan = userAction
  .schema(
    z.object({
      priceId: z.string(),
    })
  )
  .action(async ({ parsedInput: { priceId }, ctx }) => {
    const { user } = ctx;

    console.log({ priceId });
    const plan = PRICES.find(
      (p) => p.monthlyPriceId === priceId || p.yearlyPriceId === priceId
    );

    if (!plan) {
      throw new Error("Invalid plan");
    }

    const { stripeCustomerId } = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    if (!stripeCustomerId) {
      throw new Error("Invalid");
    }

    const stripeCheckout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        plan: plan.id,
      },
      mode: "subscription",
      success_url: "http://localhost:3000/auth",
      cancel_url: "http://localhost:3000/pricing",
    });

    if (!stripeCheckout.url) {
      throw new Error("Invalid");
    }

    console.log(stripeCheckout.url);

    return {
      user,
      priceId,
      success: true,
      message: "Plan upgraded successfully",
      url: stripeCheckout.url,
    };
  });
