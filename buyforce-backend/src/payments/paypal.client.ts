import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export function getPayPalClient() {
  const env = new checkoutNodeJssdk.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_CLIENT_SECRET!
  );

  return new checkoutNodeJssdk.core.PayPalHttpClient(env);
}
