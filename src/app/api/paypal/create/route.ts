import { type NextRequest, NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          description: "Anonymous Donation",
        },
      ],
      application_context: {
        return_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/donation-success`,
        cancel_url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/donation-cancelled`,
        brand_name: "Anonymous Donations",
        user_action: "PAY_NOW",
      },
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.message || "Failed to create PayPal order");
    }

    return NextResponse.json({ orderID: order.id });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create donation order" },
      { status: 500 }
    );
  }
}
