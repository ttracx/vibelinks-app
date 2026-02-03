import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.subscription.upsert({
        where: { stripeCustomerId: session.customer as string },
        update: {
          stripeSubscriptionId: session.subscription as string,
          status: "active",
          email: session.customer_email,
        },
        create: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: process.env.STRIPE_PRICE_ID,
          status: "active",
          email: session.customer_email,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeCustomerId: subscription.customer as string },
        data: { status: "canceled" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
