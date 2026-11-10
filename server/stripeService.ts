import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any
    });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_chatsuite_demo_key';
}
