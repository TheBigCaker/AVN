import wixUsers from 'wix-users';
import wixPay from 'wix-pay';
import { resolveUserTier, createUpgradeTransaction, purchaseAdSpace } from 'backend/oodaService.jsw';

let currentUser = null;
let currentTier = 'free';

$w.onReady(async function () {
  console.log("🔄 OODA Loop Engine: Armed");
  
  currentUser = wixUsers.currentUser;
  
  if (currentUser.loggedIn) {
    await runOodaSequence();
  } else {
    promptLogin();
  }

  // Bind upgrade action button
  $w("#btnUpgrade").onClick(async () => {
    await executePaymentUpgrade();
  });

  // Bind ad space purchase trigger
  $w("#btnBuyAd").onClick(async () => {
    await executeAdPurchase();
  });
});

/**
 * Main OODA Loop loop execution
 */
async function runOodaSequence() {
  // 1. OBSERVE: Fetch current user ID and subscription data
  const memberId = currentUser.id;
  const tierResponse = await resolveUserTier(memberId);
  currentTier = tierResponse.success ? tierResponse.tier : 'free';

  // 2. ORIENT: Evaluate permissions and rules based on tier
  orientUserState(currentTier);

  // 3. DECIDE: Set layout changes and pricing rules
  decidePageActions(currentTier);

  // 4. ACT: Modify visual page elements
  executeUIPulses(currentTier);
}

function promptLogin() {
  $w("#textStatus").text = "Please log in to sync with the AVN Commons.";
  $w("#btnUpgrade").disable();
  $w("#btnBuyAd").disable();
}

/**
 * 2. ORIENTATION PHASE
 */
function orientUserState(tier) {
  console.log(`[ORIENT] User tier evaluated as: ${tier.toUpperCase()}`);
  
  if (tier === 'admin') {
    $w("#statusBadgeHealth").text = "Staff Access (Treasury Pool)";
    $w("#statusBadgeAds").text = "Feed Auditor Enabled";
  } else if (tier === 'pro') {
    $w("#statusBadgeHealth").text = "Eligible (Active Health Pool)";
    $w("#statusBadgeAds").text = "Ad-Free Feed Active";
  } else {
    $w("#statusBadgeHealth").text = "Ineligible (Free Tier)";
    $w("#statusBadgeAds").text = "Ads Injected";
  }
}

/**
 * 3. DECISION PHASE
 */
function decidePageActions(tier) {
  if (tier === 'free') {
    $w("#textActionPlan").text = "Inject advertisement banners into user feed.";
    $w("#textCostBasis").text = "$0/mo";
    $w("#adBannerGroup").expand(); // Expand ads for free users
  } else {
    $w("#textActionPlan").text = tier === 'pro' ? "Access back-office HR/IT suites." : "Audit tickets.";
    $w("#textCostBasis").text = tier === 'pro' ? "$35/mo" : "Staff Payroll";
    $w("#adBannerGroup").collapse(); // Collapse/hide ads for paying members
  }
}

/**
 * 4. ACTION PHASE: UI update execution
 */
function executeUIPulses(tier) {
  if (tier === 'free') {
    $w("#btnUpgrade").label = "Upgrade to Pro Member";
    $w("#btnUpgrade").enable();
  } else if (tier === 'pro') {
    $w("#btnUpgrade").label = "Manage Subscription";
    $w("#btnUpgrade").enable();
  } else {
    $w("#btnUpgrade").label = "Staff Panel Active";
    $w("#btnUpgrade").disable();
  }
}

/**
 * Payment checkout execution (Wix Pay)
 */
async function executePaymentUpgrade() {
  $w("#btnUpgrade").disable();
  $w("#btnUpgrade").label = "Initiating Upgrade...";

  try {
    const res = await createUpgradeTransaction(currentUser.id, "pro");
    if (res.success) {
      // Trigger Wix payment light-box checkout in client browser
      const result = await wixPay.startPayment(res.paymentId);
      
      if (result.status === "Successful") {
        $w("#textStatus").text = "Success: Subscription upgraded! Reloading OODA Loop.";
        await runOodaSequence();
      } else {
        $w("#textStatus").text = "Upgrade cancelled or payment failed.";
        executeUIPulses(currentTier);
      }
    }
  } catch (e) {
    console.error("Payment failed:", e.message);
    executeUIPulses(currentTier);
  }
}

/**
 * Purchase advertising slots
 */
async function executeAdPurchase() {
  const adTitle = $w("#inputAdTitle").value;
  const adLink = $w("#inputAdLink").value;

  if (!adTitle) return;

  $w("#btnBuyAd").disable();
  
  try {
    const res = await purchaseAdSpace(currentUser.id, adTitle, adLink);
    if (res.success) {
      $w("#textStatus").text = "Success: Ad slot registered and active.";
      $w("#adsDataset").refresh();
    } else {
      $w("#textStatus").text = `Error: ${res.error}`;
    }
  } catch (e) {
    console.error("Ad creation failed:", e.message);
  }
  $w("#btnBuyAd").enable();
}
