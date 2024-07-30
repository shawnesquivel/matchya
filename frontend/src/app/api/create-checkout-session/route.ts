import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe Checkout session for subscription.
 *
 * Step 3 in the tutorial: https://docs.stripe.com/billing/subscriptions/build-subscriptions?platform=web&ui=stripe-hosted#create-session
 *
 * This function:
 * 1. Extracts lookup_key and client_reference_id from the request body.
 * 2. Retrieves the price information from Stripe using the lookup_key.
 * 3. Creates a Stripe Checkout session for subscription.
 * 4. Returns the Checkout session URL on success, or an error message on failure.
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { lookup_key, client_reference_id } = await request.json();

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ["data.product"],
    });

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions?canceled=true`,
      client_reference_id: client_reference_id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating subscription session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
