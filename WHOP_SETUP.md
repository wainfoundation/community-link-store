# Whop Payment Integration Setup

This guide will help you set up Whop payments for your Cloudy marketplace.

## Your Whop Credentials

Your integration is configured with:
- **App ID**: `app_9N0CoKFUVVFCFr`
- **Company ID**: `biz_joHaHyVLOTmzlT`
- **Agent User ID**: `user_jB6lFTJYYzq9p`
- **API Key**: Stored securely in secrets ✓
- **Webhook Secret**: Stored securely in secrets ✓

## Overview

Cloudy uses Whop for secure payment processing. When customers purchase products:
1. They pay through Whop's embedded checkout
2. Whop sends a webhook to your backend
3. The system automatically credits the seller's balance (after 10% platform fee)
4. Sellers can withdraw their earnings through Whop's payout system

## Setup Steps

### 1. Create a Whop Account
1. Go to [whop.com](https://whop.com) and sign up
2. Complete your business verification
3. Navigate to your [Developer Dashboard](https://whop.com/dashboard/developer)

### 2. Get Your API Keys
1. In the Developer Dashboard, click "Create" under "Company API Keys"
2. Name it "Cloudy Integration"
3. Select permissions: `payments:read`, `transfers:write`
4. Copy your API key - you'll need this

### 3. Configure Webhook ✓ DONE
Your webhook endpoint is deployed and configured at:
```
https://vckdnnnpvpouqvbkzhny.supabase.co/functions/v1/whop-webhook
```

**Next Steps in Whop Dashboard:**
1. Go to [Developer Dashboard](https://whop.com/dashboard/developer)
2. Click "Create Webhook" (if not already created)
3. Enter the URL above
4. Select API version: `v1`
5. Select event: `payment.succeeded`
6. Save and copy the webhook secret
7. The webhook secret should already be configured in your secrets

### 4. Secrets Configuration ✓ DONE
All required secrets have been added:
- ✓ `WHOP_API_KEY` - Your Whop API key
- ✓ `WHOP_WEBHOOK_SECRET` - Your webhook secret
- ✓ `WHOP_COMPANY_ID` - Your company ID (biz_joHaHyVLOTmzlT)

## Quick Start Guide

Now that your credentials are configured, here's how to start selling:

### Step 1: Create a Whop Plan
1. Go to your [Whop Dashboard → Checkout links](https://whop.com/dashboard/links/checkout)
2. Click "+ Create checkout link"
3. Choose "One-time" payment type
4. Set your price (e.g., $9.99)
5. Configure any additional options (stock, description, etc.)
6. Click "Create"
7. **Copy the Plan ID** - it looks like `plan_XXXXXXXXX`

### Step 2: Create Product in Cloudy
1. Navigate to your Dashboard in Cloudy
2. Click "Create Product"
3. Fill in product details:
   - Product name
   - Price (should match your Whop plan)
   - Description
   - Upload product image
   - Upload digital file (optional)
   - **Paste the Whop Plan ID** from Step 1
4. Click "Create Product"

### Step 3: Test Purchase
1. View your product in the Discover page
2. Click "Buy now"
3. Complete a test purchase with Whop test card: `4242 4242 4242 4242`
4. Verify the order appears in your Dashboard
5. Check that your balance was updated

## How It Works

### Payment Flow
1. Customer clicks "Buy now" on a product
2. Whop checkout modal opens with the product's plan
3. Customer completes payment through Whop
4. Whop sends webhook to your backend
5. System creates order record
6. Seller balance is updated automatically

### Balance Calculation
- Total Payment: 100%
- Platform Fee: 10%
- Seller Receives: 90%

Example: $100 sale = $10 platform fee + $90 to seller

### Withdrawals
Sellers can withdraw their available balance:
1. Minimum withdrawal: $10
2. Processed through Whop Transfer API
3. Processing time: 1-3 business days
4. Sellers receive funds via Whop's payout methods (ACH, Crypto, Venmo, etc.)

## Testing

To test the integration:

1. Create a test product with a Whop plan
2. Use Whop's test card: `4242 4242 4242 4242`
3. Complete a test purchase
4. Check the order appears in Dashboard
5. Verify seller balance updates correctly

## Troubleshooting

### Webhook Not Receiving Events
- Verify webhook URL is correct in Whop dashboard
- Check webhook secret matches what you added
- Review edge function logs

### Balance Not Updating
- Check orders table has `seller_id` and `seller_amount` populated
- Verify the trigger `on_order_payment_success` is enabled
- Check seller_balances table for the user

### Withdrawal Fails
- Ensure user has sufficient available balance
- Minimum withdrawal is $10
- Check edge function logs for Whop API errors

## Production Checklist

- [ ] Whop account fully verified
- [ ] API keys added to secrets
- [ ] Webhook registered and tested
- [ ] Test purchase completed successfully
- [ ] Seller balance updates correctly
- [ ] Withdrawal tested
- [ ] Platform fee percentage confirmed (default: 10%)

## Support

For Whop-specific issues:
- [Whop Documentation](https://docs.whop.com)
- [Whop Support](mailto:support@whop.com)

For Cloudy integration issues:
- Check Supabase edge function logs
- Review database tables: orders, seller_balances, withdrawals
