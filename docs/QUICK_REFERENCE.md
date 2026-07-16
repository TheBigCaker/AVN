# Quick Reference Guide

## Common Code Snippets

### Check User Subscription Tier
```javascript
import { getUserSubscriptionTier } from 'backend/subscriptionChecker';

const subscriptionInfo = await getUserSubscriptionTier();

console.log(subscriptionInfo.tier); // 'free', 'education', or 'pro'
console.log(subscriptionInfo.showAds); // true or false
```

### Hide/Show Elements Based on Subscription
```javascript
const info = await getUserSubscriptionTier();

if (info.tier === 'pro') {
  $w('#premiumContent').show();
  $w('#upgradeButton').hide();
} else {
  $w('#premiumContent').hide();
  $w('#upgradeButton').show();
}
```

### Check if User Has Active Subscription
```javascript
import { hasActiveSubscription } from 'backend/subscriptionChecker';

const isPaid = await hasActiveSubscription();

if (isPaid) {
  // User has Education or Pro subscription
} else {
  // User is on Free tier
}
```

### Purchase a Plan
```javascript
import { checkout } from 'wix-pricing-plans-frontend';

$w('#buyButton').onClick(async () => {
  try {
    const order = await checkout.createOnlineOrder('PLAN_ID_HERE');
    console.log('Purchase successful:', order);
  } catch (error) {
    console.error('Purchase failed:', error);
  }
});
```

### Get All User's Orders
```javascript
import { orders } from 'wix-pricing-plans-frontend';

const allOrders = await orders.listCurrentMemberOrders();

allOrders.forEach(order => {
  console.log(`Plan: ${order.planName}, Status: ${order.status}`);
});
```

---

## Element IDs to Update

In your `Home.js` file, update these IDs to match your actual elements:

```javascript
const adElements = [
  '#adsenseTop',       // Top banner ad
  '#adsenseSidebar',   // Sidebar ad
  '#adsenseBottom',    // Bottom ad
  '#adsenseHeader',    // Header ad
  '#adsenseFooter'     // Footer ad
];
```

Optional UI elements:
```javascript
'#subscriptionBadge'  // Shows "PRO MEMBER" or "EDUCATION MEMBER"
'#upgradeButton'      // Button to upgrade subscription
```

---

## Subscription Status Values

```javascript
'DRAFT'      // Order created but not paid
'PENDING'    // Paid, start date in future
'ACTIVE'     // Currently active subscription
'PAUSED'     // Temporarily paused
'CANCELED'   // User canceled
'ENDED'      // Subscription expired/completed
```

---

## Test Credit Cards (Test Mode Only)

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 9995 | Insufficient funds |

**Note**: Use any future expiration date and any 3-digit CVV.

---

## Common Console Commands

### Check Subscription in Browser Console
```javascript
// Paste this in browser console when logged in
wixWindow.user.getEmail().then(email => console.log('User:', email));
```

---

## Pricing Plan Properties

When you create a plan, here are the key properties:

```javascript
{
  _id: 'plan-id',
  name: 'Education',          // Display name
  description: 'Ad-free...',  // Description
  price: 1.00,                // Price in dollars
  pricing: {
    subscription: {
      cycleDuration: {
        count: 1,
        unit: 'MONTH'          // MONTH, YEAR, DAY, WEEK
      },
      cycleCount: 12           // Number of billing cycles
    }
  },
  public: true,               // Visible to all users
  allowFutureStartDate: false,
  buyerCanCancel: true
}
```

---

## Useful Wix APIs

### Check if User is Logged In
```javascript
import wixUsers from 'wix-users';

if (wixUsers.currentUser.loggedIn) {
  const email = await wixUsers.currentUser.getEmail();
  console.log('User email:', email);
}
```

### Prompt User to Log In
```javascript
import wixUsers from 'wix-users';

$w('#loginButton').onClick(async () => {
  await wixUsers.promptLogin();
  // User is now logged in
});
```

### Get Member Info
```javascript
import { currentMember } from 'wix-members-frontend';

const member = await currentMember.getMember();
console.log('Member ID:', member._id);
console.log('Member name:', member.contactDetails.firstName);
```

---

## Debugging Tips

### Enable Console Logging
Add this to your page code to see detailed logs:
```javascript
console.log('Subscription check starting...');

const info = await getUserSubscriptionTier();

console.log('Tier:', info.tier);
console.log('Show ads:', info.showAds);
console.log('Full info:', JSON.stringify(info, null, 2));
```

### Check Element IDs
```javascript
// See if your element exists
console.log($w('#adsenseTop').id); // Should log the ID

// List all elements on page
console.log($w('*').map(el => el.id));
```

### Test Collapse/Expand
```javascript
// In browser console
$w('#adsenseTop').collapse(); // Should hide with animation
$w('#adsenseTop').expand();   // Should show with animation
```

---

## Common Issues & Fixes

### Issue: Ads not hiding for paid users
**Fix**: Check browser console for errors, verify plan name matches code

### Issue: "Cannot find module 'backend/subscriptionChecker'"
**Fix**: Make sure file is in Backend folder, not Public

### Issue: Payments not working
**Fix**: Enable Wix Payments, check you're on Premium plan

### Issue: AdSense not showing
**Fix**: Verify AdSense approval, custom domain connected, elements have correct IDs

---

## Performance Optimization

### Cache Subscription Check
Instead of checking on every page:
```javascript
// In Site.js
let cachedSubscription = null;

export async function getSubscriptionCached() {
  if (!cachedSubscription) {
    cachedSubscription = await getUserSubscriptionTier();
  }
  return cachedSubscription;
}

// Clear cache on login/logout
export function clearSubscriptionCache() {
  cachedSubscription = null;
}
```

---

## Security Notes

✅ **Never** expose plan IDs as secrets (they're not sensitive)
✅ **Never** bypass payment checks on frontend (backend validates)
✅ **Always** verify subscription status on backend for sensitive operations
✅ **Don't** store payment details (Wix handles this securely)

---

## Next Steps

1. ✅ Deploy code to your Wix site
2. ✅ Create pricing plans in Wix Dashboard
3. ✅ Add AdSense elements with matching IDs
4. ✅ Test in Test Mode
5. ✅ Publish and monitor

---

## Useful Links

- **Wix Velo Docs**: https://www.wix.com/velo/reference
- **Pricing Plans API**: https://www.wix.com/velo/reference/wix-pricing-plans-frontend
- **Members API**: https://www.wix.com/velo/reference/wix-members
- **AdSense Setup**: https://support.google.com/adsense
- **Wix Support**: https://support.wix.com

---

**Pro Tip**: Keep this reference handy while developing. Most common tasks are covered here!
