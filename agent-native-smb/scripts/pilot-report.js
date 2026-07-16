#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { parseCsvText, evaluatePhase1 } = require('../src/pilot-phase1');

const argOutDir = process.argv.find((arg) => arg.startsWith('--out-dir='));
const argInputCsv = process.argv.find((arg) => arg.startsWith('--input-csv='));
const outputDir = argOutDir
  ? path.resolve(process.cwd(), argOutDir.replace('--out-dir=', ''))
  : path.resolve(process.cwd(), 'reports', 'pilot');
const inputCsvPath = argInputCsv
  ? path.resolve(process.cwd(), argInputCsv.replace('--input-csv=', ''))
  : null;

const csvHeaders = [
  'week',
  'period_start',
  'period_end',
  'active_operators',
  'jobs_processed',
  'first_invoice_minutes_from_setup',
  'parsed_accuracy_pct',
  'admin_hours_baseline',
  'admin_hours_pilot',
  'invoice_turnaround_hours_baseline',
  'invoice_turnaround_hours_pilot',
  'overdue_recovery_baseline_usd',
  'overdue_recovery_pilot_usd',
  'api_success_rate_pct',
  'invoice_totals_correct_pct',
  'security_baseline_verified',
  'nps_or_cs_score',
  'churn_risk_accounts',
  'notes',
];

const csvRows = [
  ['1', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['2', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['3', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
];

const qualifiedCsvRows = [
  [
    '1',
    '2026-05-04',
    '2026-05-10',
    '6',
    '18',
    '4.4',
    '96.1',
    '18',
    '10',
    '48',
    '16',
    '2100',
    '2850',
    '99.3',
    '100',
    'true',
    '52',
    '2',
    'Initial week with full auth/rate-limit checks verified',
  ],
  [
    '2',
    '2026-05-11',
    '2026-05-17',
    '7',
    '23',
    '3.8',
    '97.2',
    '19',
    '9',
    '46',
    '14',
    '2200',
    '3000',
    '99.5',
    '100',
    'yes',
    '55',
    '1',
    'Improved parsing quality and faster admin throughput',
  ],
  [
    '3',
    '2026-05-18',
    '2026-05-24',
    '7',
    '25',
    '3.6',
    '96.8',
    '20',
    '9',
    '44',
    '12',
    '2300',
    '3180',
    '99.4',
    '100',
    'verified',
    '57',
    '1',
    'Stable API reliability and invoice correctness maintained',
  ],
];

const dashboardTemplate = `# Pilot ROI Dashboard Template (2-3 Weeks)

## Pilot KPI Summary
| KPI | Baseline | Pilot | Delta | ROI Signal |
| --- | --- | --- | --- | --- |
| Admin time per week (hours) | {{admin_hours_baseline}} | {{admin_hours_pilot}} | {{admin_hours_delta}} | {{admin_hours_roi_signal}} |
| Invoice turnaround (hours) | {{invoice_turnaround_baseline}} | {{invoice_turnaround_pilot}} | {{invoice_turnaround_delta}} | {{invoice_turnaround_roi_signal}} |
| Overdue recovery (USD) | {{overdue_recovery_baseline}} | {{overdue_recovery_pilot}} | {{overdue_recovery_delta}} | {{overdue_recovery_roi_signal}} |
| Operator sentiment (NPS/CS) | {{sentiment_baseline}} | {{sentiment_pilot}} | {{sentiment_delta}} | {{sentiment_roi_signal}} |

## Phase 1 Completion Checklist
- [ ] Time-to-value met: first invoice generated in under 5 minutes from setup
- [ ] Accuracy met: parsed labor/parts correctness >= 95% on pilot jobs
- [ ] Reliability met: API success rate >= 99% on normal load
- [ ] Financial correctness met: invoice totals match approved labor + parts
- [ ] Security baseline met: auth, rate limits, validation, and secret handling verified
- [ ] Pilot proof targets tracked weekly (admin time saved, turnaround, overdue recovery, NPS/churn intent)

Use this command to compute completion from filled CSV data:
\`npm run pilot:report -- --input-csv=/absolute/path/to/pilot-roi.csv\`

## Phase 2 Readiness Checklist
- [ ] Data feed from pilot CSV automated into internal dashboard/BI
- [ ] Weekly ROI review cadence and owner confirmed
- [ ] Approval/invoice workflow edge cases documented and assigned
- [ ] Success thresholds validated against go/no-go criteria

## Phase 3 Readiness Checklist
- [ ] Expansion cohort defined (additional operators/accounts)
- [ ] Target ROI thresholds locked for full deployment
- [ ] Ops + finance handoff process signed off
- [ ] Rollout risk register and mitigation owners assigned
`;

fs.mkdirSync(outputDir, { recursive: true });

const csvPath = path.join(outputDir, 'pilot-roi-template.csv');
const qualifiedCsvPath = path.join(outputDir, 'pilot-roi-qualified-sample.csv');
const dashboardPath = path.join(outputDir, 'pilot-dashboard-template.md');
const phase1ReportPath = path.join(outputDir, 'phase1-completion-report.md');

const csvContent = [csvHeaders.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
const qualifiedCsvContent = [csvHeaders.join(','), ...qualifiedCsvRows.map((row) => row.join(','))].join('\n');
fs.writeFileSync(csvPath, `${csvContent}\n`, 'utf8');
fs.writeFileSync(qualifiedCsvPath, `${qualifiedCsvContent}\n`, 'utf8');
fs.writeFileSync(dashboardPath, dashboardTemplate, 'utf8');

if (inputCsvPath) {
  const csvText = fs.readFileSync(inputCsvPath, 'utf8');
  const rows = parseCsvText(csvText);
  const result = evaluatePhase1(rows);
  const mark = (value) => (value ? 'x' : ' ');
  const metric = (value, suffix = '') => (value === null ? 'N/A' : `${Number(value.toFixed(2))}${suffix}`);

  const report = `# Phase 1 Completion Report

Status: **${result.phase1Complete ? 'COMPLETE' : 'NOT COMPLETE'}**

## Checklist
- [${mark(result.checks.timeToValue)}] Time-to-value met (< 5 min first invoice)
- [${mark(result.checks.accuracy)}] Accuracy met (>= 95% parsed labor/parts correctness)
- [${mark(result.checks.reliability)}] Reliability met (>= 99% API success rate)
- [${mark(result.checks.financialCorrectness)}] Financial correctness met (100% invoice totals correctness)
- [${mark(result.checks.securityBaseline)}] Security baseline met (verified each tracked week)
- [${mark(result.checks.pilotProofTracking)}] Pilot proof targets tracked weekly

## Metric snapshot
- Minimum first invoice minutes from setup: ${metric(result.metricSnapshot.minFirstInvoiceMinutes, ' min')}
- Average parsed accuracy: ${metric(result.metricSnapshot.avgParsedAccuracyPct, '%')}
- Average API success rate: ${metric(result.metricSnapshot.avgApiSuccessRatePct, '%')}
- Average invoice totals correctness: ${metric(result.metricSnapshot.avgInvoiceTotalsCorrectPct, '%')}
- Security baseline all verified: ${result.metricSnapshot.securityBaselineAllVerified ? 'Yes' : 'No'}
- Weekly pilot proof tracking present: ${result.metricSnapshot.weeklyPilotProofTracked ? 'Yes' : 'No'}
`;

  fs.writeFileSync(phase1ReportPath, report, 'utf8');
}

console.log(`Pilot ROI CSV template: ${csvPath}`);
console.log(`Pilot ROI qualified sample: ${qualifiedCsvPath}`);
console.log(`Pilot dashboard template: ${dashboardPath}`);
if (inputCsvPath) {
  console.log(`Phase 1 completion report: ${phase1ReportPath}`);
}
console.log('Tip: pass --out-dir=<path> to write templates elsewhere.');
