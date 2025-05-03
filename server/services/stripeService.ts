import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not defined. Stripe features will not work correctly.');
}

// Initialize Stripe client
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-03-31.basil' as any })
  : null;

export const stripeService = {
  /**
   * Create a payment intent for one-time payments
   * @param amount Amount to charge in dollars (will be converted to cents)
   * @returns Payment intent client secret and ID
   */
  createPaymentIntent: async (amount: number): Promise<{ clientSecret: string | null; paymentIntentId: string }> => {
    if (!stripe) {
      console.error('Stripe is not configured. Cannot create payment intent.');
      return { clientSecret: null, paymentIntentId: 'stripe-not-configured' };
    }
    
    try {
      // Convert amount to cents (Stripe uses smallest currency unit)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
      });
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }
};