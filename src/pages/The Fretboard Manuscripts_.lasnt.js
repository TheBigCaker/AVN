import { local } from 'wix-storage';

// Breathing Pacer phase tracking (5.8 seconds per phase)
let breathTimer = null;
let breathState = 'inhale';

$w.onReady(function () {
  console.log("🏡 Homepage: Alternative Vibration Network Main Portal");
  
  // 1. Retrieve the cached predictions from the master page load
  const cachedData = local.getItem("tap_daily_metrics");
  if (cachedData) {
    const predictions = JSON.parse(cachedData);
    populateDashboardMetrics(predictions);
  } else {
    console.warn("Predictions not available in local cache.");
  }

  // 2. Setup interactive triggers for all 5 domains
  setupLogisticsRouting();
  setupTelluricAgriculture();
  setupDeFiArbitrage();
  setupSomaticResonance();
  setupGridIsolation();
});

/**
 * Maps predictions to page UI elements on load
 */
function populateDashboardMetrics(predictions) {
  // Seismic
  if ($w('#textSeismicVerdict')) {
    $w('#textSeismicVerdict').text = predictions.seismic.verdict;
  }
  if ($w('#textMaxMag')) {
    $w('#textMaxMag').text = `Observed Max: M${predictions.seismic.actual_max}`;
  }

  // Weather (Fresno Anomaly example)
  if ($w('#textFresnoTemp')) {
    $w('#textFresnoTemp').text = "104.2°F";
  }
  if ($w('#textFresnoAnomaly')) {
    $w('#textFresnoAnomaly').text = "+5.58°F Anomaly";
  }

  // Finance
  if ($w('#textActiveContracts')) {
    $w('#textActiveContracts').text = predictions.finance.total_contracts.toString();
  }
  if ($w('#textSellSignals')) {
    $w('#textSellSignals').text = predictions.finance.sell_signals.toString();
  }

  // Cosmic
  if ($w('#textDriftStrikeSlip')) {
    $w('#textDriftStrikeSlip').text = predictions.cosmic.couplings.california_strike_slip.toFixed(4);
  }
}

/* ─── DOMAIN 1: SMART LOGISTICS ────────────────────────────────────────── */
function setupLogisticsRouting() {
  if ($w('#btnCalcRoute')) {
    $w('#btnCalcRoute').onClick(() => {
      // Toggle detour calculations
      const isDetourActive = $w('#btnCalcRoute').label.includes("Recalculate");
      
      if (isDetourActive) {
        $w('#textRouteCost').text = "$1,420";
        $w('#textRouteTime').text = "188 mins";
        $w('#textRouteWarning').text = "Detour active. San Andreas fault zone bypassed.";
        $w('#btnCalcRoute').label = "Restore Standard Route";
      } else {
        $w('#textRouteCost').text = "$1,240";
        $w('#textRouteTime').text = "161 mins";
        $w('#textRouteWarning').text = "Warning: Crosses San Andreas fault (M6+ Trigger Zone).";
        $w('#btnCalcRoute').label = "Recalculate Safe Route";
      }
    });
  }
}

/* ─── DOMAIN 2: TELLURIC AGRICULTURE ───────────────────────────────────── */
function setupTelluricAgriculture() {
  if ($w('#switchAgMode')) {
    $w('#switchAgMode').onChange(() => {
      const optimized = $w('#switchAgMode').checked;
      
      if (optimized) {
        $w('#textWaterUsage').text = "2,880 Gallons/day";
        $w('#textAgEfficiency').text = "92% Efficiency";
        $w('#textAgModeStatus').text = "TAP Telluric Optimization Active";
      } else {
        $w('#textWaterUsage').text = "4,500 Gallons/day";
        $w('#textAgEfficiency').text = "64% Efficiency";
        $w('#textAgModeStatus').text = "Static Timer Mode Active";
      }
    });
  }
}

/* ─── DOMAIN 3: DEFI ARBITRAGE ─────────────────────────────────────────── */
function setupDeFiArbitrage() {
  if ($w('#btnDeployHedging')) {
    $w('#btnDeployHedging').onClick(() => {
      $w('#btnDeployHedging').disable();
      $w('#btnDeployHedging').label = "Deploying Contracts...";
      
      setTimeout(() => {
        $w('#textYieldMetrics').text = "+14.82% Net Yield";
        $w('#textDeFiStatus').text = "Volatility Hedging Contract Active";
        $w('#btnDeployHedging').label = "Hedging Active";
      }, 1500);
    });
  }
}

/* ─── DOMAIN 4: SOMATIC RESONANCE ──────────────────────────────────────── */
function setupSomaticResonance() {
  if ($w('#btnStartBreathGuide')) {
    $w('#btnStartBreathGuide').onClick(() => {
      const active = $w('#btnStartBreathGuide').label.includes("Start");
      
      if (active) {
        $w('#btnStartBreathGuide').label = "Stop Respiration Guide";
        $w('#textBreathState').text = "Inhale...";
        
        // Loop breathing cycle (5.8 seconds phase lock)
        breathTimer = setInterval(() => {
          if (breathState === 'inhale') {
            $w('#textBreathState').text = "Exhale...";
            breathState = 'exhale';
          } else {
            $w('#textBreathState').text = "Inhale...";
            breathState = 'inhale';
          }
        }, 5800);
      } else {
        clearInterval(breathTimer);
        $w('#btnStartBreathGuide').label = "Start Respiration Guide";
        $w('#textBreathState').text = "Pacer Paused";
      }
    });
  }
}

/* ─── DOMAIN 5: GRID ISOLATION ─────────────────────────────────────────── */
function setupGridIsolation() {
  if ($w('#btnTriggerStormTest')) {
    $w('#btnTriggerStormTest').onClick(() => {
      const active = $w('#btnTriggerStormTest').label.includes("Simulate");
      
      if (active) {
        $w('#textGridStrain').text = "CRITICAL OVERLOAD";
        $w('#textRelayStatus').text = "ISOLATED / SAFE ROUTING";
        $w('#btnTriggerStormTest').label = "Reset Power Grid";
      } else {
        $w('#textGridStrain').text = "NORMAL Strain";
        $w('#textRelayStatus').text = "ARMED Relay";
        $w('#btnTriggerStormTest').label = "Simulate Geomagnetic Storm";
      }
    });
  }
}
