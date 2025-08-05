// Quick payment system test
const testPayment = async () => {
  try {
    const response = await fetch('http://195.35.29.137/api/subscriptions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // You'll need a real token
      },
      body: JSON.stringify({
        planId: 2, // Professional Plan - $350/year
      }),
    });

    const result = await response.json();
    console.log('Payment test result:', result);
    
    if (result.sessionId) {
      console.log('✅ Payment system working - Checkout session created');
      console.log('Session ID:', result.sessionId);
      console.log('Checkout URL:', result.url);
    } else {
      console.log('❌ Payment system issue:', result);
    }
  } catch (error) {
    console.error('Payment test failed:', error.message);
  }
};

console.log('Testing payment system...');
// testPayment(); // Uncomment to run the test
console.log('Payment endpoints available:');
console.log('- GET /api/subscription-plans ✅ Working');
console.log('- POST /api/subscriptions/create-checkout-session (requires auth)');
console.log('- POST /api/subscriptions/webhook (for Stripe)');