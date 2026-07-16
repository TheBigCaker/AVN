function toNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function round(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(Number(value).toFixed(2));
}

function toTrendSignal(delta, direction) {
  if (delta === null) {
    return 'N/A';
  }

  if (delta === 0) {
    return 'flat';
  }

  if (direction === 'down') {
    return delta < 0 ? 'improving' : 'worsening';
  }

  return delta > 0 ? 'improving' : 'worsening';
}

function buildBiFeed(rows) {
  const records = rows.map((row) => ({
    week: row.week || null,
    period_start: row.period_start || null,
    period_end: row.period_end || null,
    active_operators: toNumber(row.active_operators),
    jobs_processed: toNumber(row.jobs_processed),
    admin_hours_baseline: toNumber(row.admin_hours_baseline),
    admin_hours_pilot: toNumber(row.admin_hours_pilot),
    invoice_turnaround_hours_baseline: toNumber(row.invoice_turnaround_hours_baseline),
    invoice_turnaround_hours_pilot: toNumber(row.invoice_turnaround_hours_pilot),
    overdue_recovery_baseline_usd: toNumber(row.overdue_recovery_baseline_usd),
    overdue_recovery_pilot_usd: toNumber(row.overdue_recovery_pilot_usd),
    nps_or_cs_score: toNumber(row.nps_or_cs_score),
    churn_risk_accounts: toNumber(row.churn_risk_accounts),
  }));

  const adminBaselineAvg = average(records.map((record) => record.admin_hours_baseline).filter((value) => value !== null));
  const adminPilotAvg = average(records.map((record) => record.admin_hours_pilot).filter((value) => value !== null));
  const turnaroundBaselineAvg = average(
    records.map((record) => record.invoice_turnaround_hours_baseline).filter((value) => value !== null)
  );
  const turnaroundPilotAvg = average(
    records.map((record) => record.invoice_turnaround_hours_pilot).filter((value) => value !== null)
  );
  const overdueBaselineAvg = average(
    records.map((record) => record.overdue_recovery_baseline_usd).filter((value) => value !== null)
  );
  const overduePilotAvg = average(records.map((record) => record.overdue_recovery_pilot_usd).filter((value) => value !== null));
  const sentimentAvg = average(records.map((record) => record.nps_or_cs_score).filter((value) => value !== null));
  const churnRiskAvg = average(records.map((record) => record.churn_risk_accounts).filter((value) => value !== null));
  const totalJobsProcessed = records.reduce((sum, record) => sum + (record.jobs_processed || 0), 0);

  const kpiSummary = {
    totalJobsProcessed,
    adminHoursDelta: round((adminPilotAvg ?? 0) - (adminBaselineAvg ?? 0)),
    adminHoursSignal: toTrendSignal(round((adminPilotAvg ?? 0) - (adminBaselineAvg ?? 0)), 'down'),
    turnaroundHoursDelta: round((turnaroundPilotAvg ?? 0) - (turnaroundBaselineAvg ?? 0)),
    turnaroundHoursSignal: toTrendSignal(round((turnaroundPilotAvg ?? 0) - (turnaroundBaselineAvg ?? 0)), 'down'),
    overdueRecoveryDeltaUsd: round((overduePilotAvg ?? 0) - (overdueBaselineAvg ?? 0)),
    overdueRecoverySignal: toTrendSignal(round((overduePilotAvg ?? 0) - (overdueBaselineAvg ?? 0)), 'up'),
    avgSentiment: round(sentimentAvg),
    avgChurnRiskAccounts: round(churnRiskAvg),
  };

  return {
    records,
    kpiSummary,
  };
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function normalizeEdgeCases(input) {
  if (Array.isArray(input)) {
    return input;
  }

  if (input && Array.isArray(input.edge_cases)) {
    return input.edge_cases;
  }

  return [];
}

function evaluatePhase2Readiness({ rows, reviewCadence, edgeCases, phase1Result }) {
  const normalizedEdgeCases = normalizeEdgeCases(edgeCases);

  const checks = {
    dataFeedAutomated:
      Array.isArray(rows)
      && rows.length >= 2
      && rows.every((row) => hasValue(row.week) && toNumber(row.jobs_processed) !== null),
    weeklyRoiReviewCadence:
      Boolean(reviewCadence)
      && String(reviewCadence.frequency || '').trim().toLowerCase() === 'weekly'
      && hasValue(reviewCadence.owner)
      && hasValue(reviewCadence.day_of_week)
      && hasValue(reviewCadence.time_utc),
    edgeCasesDocumented:
      normalizedEdgeCases.length > 0
      && normalizedEdgeCases.every(
        (item) => hasValue(item.case_id) && hasValue(item.scenario) && hasValue(item.owner) && hasValue(item.status)
      ),
    successThresholdsValidated: Boolean(phase1Result && phase1Result.phase1Complete),
  };

  return {
    checks,
    phase2Ready: Object.values(checks).every(Boolean),
  };
}

module.exports = {
  buildBiFeed,
  evaluatePhase2Readiness,
  toNumber,
};
