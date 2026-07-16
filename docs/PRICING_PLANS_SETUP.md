# Wix Pricing Plans Setup Guide

## Overview
This guide will help you set up 3 subscription tiers for your Wix site with conditional Google AdSense display.

## Subscription Tiers

| Tier | Price | Ads | Description |
|------|-------|-----|-------------|
| **Free** | $0/month | ✅ Yes | Default tier with Google AdSense ads |
| **Education** | $1/month | ❌ No | No ads, for students and educators |
| **Pro** | $2/month | ❌ No | No ads, full access |

---

## Step 1: Install Wix Pricing Plans App

1. Go to your Wix Dashboard
2. Click **Apps** in the left sidebar
3. Search for **"Pricing Plans"** 
4. Click **Add to Site**
5. Follow the setup wizard

---

## Step 2: Enable Wix Payments

Before you can accept payments, you need to enable Wix Payments:

1. Go to **Settings** → **Accept Payments**
2. Click **Connect Payment Method**
3. Choose **Wix Payments** (recommended) or connect Stripe/PayPal
4. Complete the verification process
5. **Important**: You need a **Wix Premium Plan** (Core or higher) to accept payments

---

## Step 3: Create Your Pricing Plans

### Free Plan (Default)
1. In Pricing Plans app, click **+ Create Plan**
2. Fill in:
   - **Plan Name**: `Free`
   - **Description**: `Free access with ads`
   - **Price**: `$0.00`
   - **Duration**: One-time payment, unlimited
   - **Visibility**: Public
3. Click **Save**

### Education Plan
1. Click **+ Create Plan**
2. Fill in:
   - **Plan Name**: `Education`
   - **Description**: `Ad-free experience for students and educators`
   - **Price**: `$1.00`
   - **Billing Cycle**: Monthly
   - **Duration**: Recurring (until canceled)
   - **Visibility**: Public
3. Click **Save**

### Pro Plan
1. Click **+ Create Plan**
2. Fill in:
   - **Plan Name**: `Pro`
   - **Description**: `Premium ad-free experience`
   - **Price**: `$2.00`
   - **Billing Cycle**: Monthly
   - **Duration**: Recurring (until canceled)
   - **Visibility**: Public
3. Click **Save**

---

## Step 4: Add Velo Code to Your Site

### 4.1 Enable Velo (if not already enabled)
1. Click **Dev Mode** toggle in the top bar
2. This opens the Velo sidebar

### 4.2 Add Backend Code
1. In the Velo sidebar, expand **Backend** folder
2. Click the **+** icon → **New .jsw File**
3. Name it: `subscriptionChecker.jsw`
4. Copy the content from `/backend/subscriptionChecker.jsw` into this file
5. Click **Save**

### 4.3 Add Frontend Page Code

**For your main page (Home):**
1. Select your Home page in the Pages panel
2. Click the **Page Code** icon (top of Velo sidebar)
3. Copy the content from `/pages/Home.js` 
4. Paste it into your page code (replace existing `$w.onReady`)
5. **Important**: Update the element IDs to match your actual AdSense element IDs:
   - `#adsenseTop` → Your top ad element ID
   - `#adsenseSidebar` → Your sidebar ad element ID
   - etc.

**For site-wide code:**
1. In Velo sidebar, expand **Public & Backend**
2. Open **Site** tab (or create it)
3. Copy content from `/pages/Site.js`
4. This handles login/logout events

---

## Step 5: Add Google AdSense

### 5.1 Install Wix Monetize with AdSense App
1. Go to Wix App Market
2. Search **"Wix Monetize with AdSense"**
3. Click **Add to Site**
4. Connect your Google AdSense account
5. **Important**: You need:
   - A custom domain (AdSense requirement)
   - An approved Google AdSense account

### 5.2 Place AdSense Elements on Your Page
1. Drag **AdSense elements** from the app onto your page
2. Position them where you want ads (header, sidebar, footer, etc.)
3. **Critical**: Give each element a unique ID:
   - Click the element
   - In Properties panel, set **ID** to match your code:
     - `adsenseTop`
     - `adsenseSidebar`
     - `adsenseBottom`
     - etc. (no # symbol in the ID field)

### 5.3 Update Your Code with Actual Element IDs
Go back to your `Home.js` page code and update the `adElements` array to match the IDs you assigned.

---

## Step 6: Create a Pricing Plans Page (Optional)

1. Add a new page called "Pricing" or "Subscribe"
2. Add the **Pricing Plans Widget** from the Wix Editor
3. This automatically displays all your plans with buy buttons
4. Customize the appearance to match your site

OR create a custom pricing page with buttons that trigger:
```javascript
import { checkout } from 'wix-pricing-plans-frontend';

$w('#buyEducationBtn').onClick(() => {
  checkout.createOnlineOrder('EDUCATION_PLAN_ID_HERE')
    .then((order) => {
      console.log('Order created:', order);
    });
});
```

---

## Step 7: Test Your Implementation

### Testing AdSense Display

1. **As a Free User (logged out):**
   - Visit your site
   - ✅ You should see AdSense ads

2. **As a Free User (logged in, no subscription):**
   - Create a test account
   - Log in
   - ✅ You should see AdSense ads

3. **As an Education/Pro Subscriber:**
   - Purchase a plan using Wix's test payment mode
   - Log in with that account
   - ✅ Ads should be hidden

### Enable Test Payment Mode
1. Go to **Settings** → **Accept Payments**
2. Toggle **Test Mode** ON
3. Use test credit cards from Wix documentation
4. **Don't forget to turn off Test Mode before going live!**

---

## Step 8: Publish Your Site

1. Click **Publish** in the top right
2. Your pricing plans and subscription system are now live!
3. AdSense ads will show/hide based on user subscription tier

---

## Troubleshooting

### Ads Not Showing for Free Users
- Check browser console for errors
- Verify element IDs match between code and actual elements
- Make sure AdSense elements are set to "Hidden on load" in their settings

### Ads Still Showing for Paid Subscribers
- Verify the plan name in Wix matches what's in `determineTierFromPlanName()` function
- Check browser console logs for subscription tier
- Make sure user has an ACTIVE subscription status

### Payments Not Working
- Verify Wix Payments is enabled
- Check you're on a Wix Premium plan (Core or higher)
- Ensure Test Mode is OFF for production

### AdSense Not Approved
- AdSense requires:
  - Custom domain (not yoursite.wixsite.com)
  - Original content
  - Compliance with Google policies
  - Apply at: https://www.google.com/adsense/

---

## Important Notes

1. **Pricing Plans requires a Premium Wix plan** (Core or higher, ~$17-159/month)
2. **AdSense requires a custom domain** (not free .wixsite.com subdomain)
3. **Test Mode**: Always test subscriptions in test mode first
4. **Wix Handles All Payments**: No need for Stripe/PayPal API keys, Wix manages everything
5. **Per-Device Limitation**: Wix Pricing Plans are per-user, not per-device. To do per-device, you'd need custom logic with device fingerprinting (advanced)

---

## Next Steps

After setup is complete:
1. Customize the pricing page design
2. Add marketing copy explaining each tier
3. Consider offering a free trial for Education/Pro plans
4. Monitor subscription analytics in Wix Dashboard
5. Set up email automations for new subscribers

---

## Support Resources

- **Wix Pricing Plans Docs**: https://support.wix.com/en/article/about-pricing-plans
- **Velo Pricing Plans API**: https://www.wix.com/velo/reference/wix-pricing-plans-frontend
- **Google AdSense Help**: https://support.google.com/adsense
- **Wix Payments Setup**: https://support.wix.com/en/article/getting-started-with-wix-payments
