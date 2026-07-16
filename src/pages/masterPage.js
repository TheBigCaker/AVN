/**
 * ═══════════════════════════════════════════════════
 *  ALTERNATIVE VIBRATION NETWORK — MASTER PAGE (V50)
 *  Global controller for the alt-vibe.net ecosystem.
 *  Initializes telluric-cosmic indices for all pages.
 * ═══════════════════════════════════════════════════
 */
import { getLatestPredictions } from 'backend/tapService.jsw';
import { local } from 'wix-storage';

$w.onReady(async function () {
  console.log("⚡ Alternative Vibration Network: Online");
  await initializeGlobalMetrics();
});

/**
 * Retrieves the latest TAP daily predictions and stores them locally
 * for fast access across all sub-pages.
 */
async function initializeGlobalMetrics() {
  try {
    const res = await getLatestPredictions();
    if (res.success) {
      console.log(`[AVN] Loaded daily predictions for date: ${res.date}`);
      
      // Store in local storage for sub-pages to read instantly
      local.setItem("tap_daily_metrics", JSON.stringify(res.data));

      // Apply global visual state overrides if elements are present in header/footer
      applyGlobalUI(res.data);
    } else {
      console.warn("⚠ Predictions not found, waiting for pipeline backfill.");
    }
  } catch (err) {
    console.error("⚠ Global initialization failed:", err.message);
  }
}

/**
 * Updates global header/footer elements if they are present on the current layout.
 * @param {object} predictions - The complete daily predictions dataset
 */
function applyGlobalUI(predictions) {
  // 1. Planetary Kp Status Indicator
  try {
    if ($w('#textGlobalKp')) {
      const kp = predictions.cosmic.current_kp || 0;
      $w('#textGlobalKp').text = `Kp: ${kp.toFixed(2)}`;
      
      // Apply color coding based on geomagnetic activity
      if (kp >= 5) {
        $w('#textGlobalKp').style.color = '#ff5e62'; // Red (Geomagnetic Storm)
      } else if (kp >= 3) {
        $w('#textGlobalKp').style.color = '#ffc107'; // Yellow (Unsettled)
      } else {
        $w('#textGlobalKp').style.color = '#00f2fe'; // Cyan (Calm / Resonant)
      }
    }
  } catch (e) {}

  // 2. Global Seismic Window Status
  try {
    if ($w('#textGlobalSeismic')) {
      $w('#textGlobalSeismic').text = predictions.seismic.framework_prediction;
    }
  } catch (e) {}

  // 3. Global Telluric Alignment Drift
  try {
    if ($w('#textGlobalDrift')) {
      const drift = predictions.cosmic.couplings.california_strike_slip || 0;
      $w('#textGlobalDrift').text = `Drift: +${drift.toFixed(4)}`;
    }
  } catch (e) {}
}
