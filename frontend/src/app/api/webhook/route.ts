import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updatePineconeProfileSubscription } from "../../utils/pineconeHelpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent created: ${paymentIntentCreated.id}`);
        // await logPayment(paymentIntentCreated);
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // await updateUserSubscription(paymentIntent.customer as string, 'active');
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPaymentIntent.id}`);
        // Handle failed payment, maybe notify the user
        // await notifyUserOfFailedPayment(failedPaymentIntent.customer as string);
        break;
      case "customer.created":
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer created: ${customer.id}`);
        // await createCustomer(customer);
        break;
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.client_reference_id;
        const stripeCustomerId = session.customer;
        const subscriptionId = session.subscription;

        const profileUpdateStatus = await updatePineconeProfileSubscription(
          clerkUserId,
          stripeCustomerId,
          subscriptionId
        );

        if (profileUpdateStatus === 200) {
          console.log(`Pinecone profile updated for ${clerkUserId}`);
        } else {
          console.log(`Pinecone profile update failed for ${clerkUserId}`);
        }

        console.log("Updated subscription status returning", true);
        return NextResponse.json({ received: true });
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
