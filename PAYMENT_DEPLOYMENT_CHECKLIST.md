# Payment System Deployment Checklist

## Before Deployment:

### 1. Environment Variables ✅
- [ ] STRIPE_SECRET_KEY (sk_live_... for production)
- [ ] STRIPE_PUBLISHABLE_KEY (pk_live_... for production)  
- [ ] VITE_STRIPE_PUBLISHABLE_KEY (pk_live_... for production)
- [ ] STRIPE_WEBHOOK_SECRET (optional but recommended)
- [ ] DATABASE_URL (production database)
- [ ] SESSION_SECRET (secure random string)
- [ ] FRONTEND_URL (your domain)

### 2. Database Setup ✅
- [ ] Run DATABASE_PAYMENT_SCHEMA_SETUP.sql
- [ ] Verify payment tables exist
- [ ] Test database connection

### 3. Stripe Configuration ✅
- [ ] Create Stripe account
- [ ] Get live API keys
- [ ] Set up webhook endpoint: https://yourdomain.com/api/subscriptions/webhook
- [ ] Configure webhook events: checkout.session.completed, customer.subscription.updated

### 4. Frontend Build ✅
- [ ] npm run build
- [ ] Verify dist/client folder exists
- [ ] Test payment form loads

### 5. Testing ✅
- [ ] Test registration flow
- [ ] Test payment method creation
- [ ] Test subscription creation
- [ ] Test webhook handling

## After Deployment:

### 1. Verify Endpoints ✅
- [ ] GET /api/subscriptions/plans
- [ ] POST /api/create-payment-method
- [ ] POST /api/complete-registration
- [ ] POST /api/subscriptions/webhook

### 2. Test Payment Flow ✅
- [ ] Complete registration with test card: 4242424242424242
- [ ] Verify user account creation
- [ ] Verify payment method storage
- [ ] Test trial period

### 3. Monitor ✅
- [ ] Check server logs
- [ ] Monitor Stripe dashboard
- [ ] Test webhook delivery

## Common Issues & Solutions:

### Payment Method Not Saving:
- Check STRIPE_SECRET_KEY is set
- Verify /api/create-payment-method endpoint exists
- Check database connection

### Registration Failing:
- Verify DATABASE_URL is correct
- Check if users table exists
- Ensure password hashing works

### Webhooks Not Working:
- Set STRIPE_WEBHOOK_SECRET
- Verify webhook URL in Stripe dashboard
- Check webhook endpoint responds with 200

## Support:
If you encounter issues, check:
1. Server logs for errors
2. Browser console for frontend errors
3. Stripe dashboard for payment events
4. Database logs for connection issues
