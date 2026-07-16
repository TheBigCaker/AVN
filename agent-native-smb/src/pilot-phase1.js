function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'verified', 'pass'].includes(normalized);
}

function parseCsvText(csvText) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      continue;
    }

    currentCell += char;
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => (cell || '').trim() !== ''))
    .map((row) => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = (row[index] || '').trim();
      });
      return entry;
    });
}

function average(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function evaluatePhase1(rows) {
  const firstInvoiceMinutes = rows
    .map((row) => toNumber(row.first_invoice_minutes_from_setup))
    .filter((value) => value !== null);

  const parsedAccuracyValues = rows
    .map((row) => toNumber(row.parsed_accuracy_pct))
    .filter((value) => value !== null);

  const apiSuccessValues = rows
    .map((row) => toNumber(row.api_success_rate_pct))
    .filter((value) => value !== null);

  const invoiceCorrectValues = rows
    .map((row) => toNumber(row.invoice_totals_correct_pct))
    .filter((value) => value !== null);

  const securityFlags = rows
    .map((row) => row.security_baseline_verified)
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '');

  const weeklyProofFields = [
    'admin_hours_baseline',
    'admin_hours_pilot',
    'invoice_turnaround_hours_baseline',
    'invoice_turnaround_hours_pilot',
    'overdue_recovery_baseline_usd',
    'overdue_recovery_pilot_usd',
    'nps_or_cs_score',
    'churn_risk_accounts',
  ];

  const trackingRows = rows.filter((row) => toNumber(row.jobs_processed) !== null || row.period_start || row.period_end);
  const pilotProofTracked = trackingRows.length >= 2
    && trackingRows.every((row) => weeklyProofFields.every((field) => String(row[field] || '').trim() !== ''));

  const metricSnapshot = {
    minFirstInvoiceMinutes: firstInvoiceMinutes.length ? Math.min(...firstInvoiceMinutes) : null,
    avgParsedAccuracyPct: average(parsedAccuracyValues),
    avgApiSuccessRatePct: average(apiSuccessValues),
    avgInvoiceTotalsCorrectPct: average(invoiceCorrectValues),
    securityBaselineAllVerified: securityFlags.length > 0 && securityFlags.every((value) => toBoolean(value)),
    weeklyPilotProofTracked: pilotProofTracked,
  };

  const checks = {
    timeToValue: metricSnapshot.minFirstInvoiceMinutes !== null && metricSnapshot.minFirstInvoiceMinutes < 5,
    accuracy: metricSnapshot.avgParsedAccuracyPct !== null && metricSnapshot.avgParsedAccuracyPct >= 95,
    reliability: metricSnapshot.avgApiSuccessRatePct !== null && metricSnapshot.avgApiSuccessRatePct >= 99,
    financialCorrectness:
      metricSnapshot.avgInvoiceTotalsCorrectPct !== null && metricSnapshot.avgInvoiceTotalsCorrectPct >= 100,
    securityBaseline: metricSnapshot.securityBaselineAllVerified,
    pilotProofTracking: metricSnapshot.weeklyPilotProofTracked,
  };

  return {
    checks,
    metricSnapshot,
    phase1Complete: Object.values(checks).every(Boolean),
  };
}

module.exports = {
  parseCsvText,
  evaluatePhase1,
  toNumber,
  toBoolean,
};
