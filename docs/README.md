# Wix Subscription System with Ad Management

## Overview
This folder contains all the Velo code needed to implement a 3-tier subscription system with conditional Google AdSense display for your Wix site.

## Subscription Tiers
- **Free** ($0/month) - Shows Google AdSense ads
- **Education** ($1/month) - No ads
- **Pro** ($2/month) - No ads

## What's Included

### Backend Code
- **`backend/subscriptionChecker.jsw`** - Checks user subscription tier and determines if ads should be shown

### Frontend Code
- **`pages/Home.js`** - Example page code for your main page
- **`pages/Site.js`** - Site-wide code for handling login/logout events
- **`pages/PricingPage.js`** - (Optional) Example custom pricing page

### Documentation
- **`PRICING_PLANS_SETUP.md`** - Complete step-by-step setup guide
- **`DEPLOYMENT_GUIDE.md`** - How to deploy these files to your Wix site
- **`QUICK_REFERENCE.md`** - Quick code snippets and troubleshooting

## Quick Start

### Option 1: Copy Files Manually (Easiest)
1. Open your Wix site in the Wix Editor
2. Enable Dev Mode (Velo)
3. Create a new backend file: `subscriptionChecker.jsw`
4. Copy the content from `backend/subscriptionChecker.jsw`
5. Add the page code from `pages/Home.js` to your main page
6. Follow the setup guide in `PRICING_PLANS_SETUP.md`

### Option 2: Use Git (Advanced)
1. Clone this folder into your Wix site repository
2. Run `wix dev` to test locally
3. Push changes to sync with your Wix site

## File Structure
```
wix-velo-code/
├── backend/
│   └── subscriptionChecker.jsw       # Backend subscription checker
├── pages/
│   ├── Home.js                        # Main page code example
│   ├── Site.js                        # Site-wide code
│   └── PricingPage.js                 # Custom pricing page example
├── public/
│   └── (optional CSS/assets)
├── PRICING_PLANS_SETUP.md            # Main setup guide
├── DEPLOYMENT_GUIDE.md               # Deployment instructions
├── QUICK_REFERENCE.md                # Code snippets & troubleshooting
└── README.md                         # This file
```

## Prerequisites

Before you begin, make sure you have:
- ✅ Wix Premium Plan (Core or higher) - Required for payments
- ✅ Google AdSense account - Must be approved by Google
- ✅ Custom domain connected to your site - Required for AdSense
- ✅ Wix Pricing Plans app installed
- ✅ Wix Payments enabled

## Key Features

### Backend Features
- Automatic subscription tier detection
- Checks if user is logged in
- Returns detailed subscription info (tier, plan name, dates, etc.)
- Error handling with fallback to free tier

### Frontend Features
- Automatically shows/hides AdSense ads based on subscription
- Updates UI elements based on subscription tier (badges, buttons)
- Handles multiple ad placements across the page
- Smooth transitions with collapse/expand animations

## How It Works

1. **User visits site** → Backend checks subscription status
2. **Free tier** → AdSense ads are displayed
3. **Paid tier** → AdSense ads are hidden
4. **User subscribes** → Wix handles payment & subscription management
5. **Subscription renews** → Wix handles automatic billing
6. **User cancels** → Ads automatically reappear on next visit

## Important Notes

### Per-Device vs Per-User Subscriptions
⚠️ **Note**: Wix Pricing Plans are **per-user**, not per-device. If a user logs in on multiple devices with the same account, they get ad-free experience on all devices.

To implement true per-device subscriptions, you would need:
- Device fingerprinting (advanced)
- Custom backend logic to track devices
- Separate subscription records per device

For most use cases, per-user subscriptions work well and are easier to manage.

### AdSense Requirements
- Custom domain (not .wixsite.com)
- Original, quality content
- Compliance with Google AdSense policies
- Approval from Google (can take 1-2 weeks)

### Testing Payments
Always use **Test Mode** in Wix Payments when testing:
1. Go to Settings → Accept Payments
2. Toggle Test Mode ON
3. Use test credit card numbers from Wix docs
4. Turn OFF before going live!

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify element IDs match between code and editor
3. Ensure Pricing Plans app is installed and configured
4. Review the troubleshooting section in `PRICING_PLANS_SETUP.md`

## Next Steps

1. Read `PRICING_PLANS_SETUP.md` for complete setup instructions
2. Copy the code files into your Wix site
3. Create your pricing plans in the Wix Dashboard
4. Add AdSense elements to your pages
5. Test with Test Mode enabled
6. Publish your site!

---

**Questions?** Check the documentation files or consult:
- Wix Velo Docs: https://www.wix.com/velo
- Wix Pricing Plans: https://support.wix.com/en/article/about-pricing-plans
- Google AdSense: https://support.google.com/adsense
