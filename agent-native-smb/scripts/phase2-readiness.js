#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { parseCsvText, evaluatePhase1 } = require('../src/pilot-phase1');
const { buildBiFeed, evaluatePhase2Readiness } = require('../src/phase2-readiness');

const argOutDir = process.argv.find((arg) => arg.startsWith('--out-dir='));
const argInputCsv = process.argv.find((arg) => arg.startsWith('--input-csv='));
const argReviewConfig = process.argv.find((arg) => arg.startsWith('--review-config='));
const argEdgeCases = process.argv.find((arg) => arg.startsWith('--edge-cases='));

const outputDir = argOutDir
  ? path.resolve(process.cwd(), argOutDir.replace('--out-dir=', ''))
  : path.resolve(process.cwd(), 'reports', 'pilot');

const inputCsvPath = argInputCsv
  ? path.resolve(process.cwd(), argInputCsv.replace('--input-csv=', ''))
  : path.resolve(process.cwd(), 'reports', 'pilot', 'pilot-roi-qualified-sample.csv');

const reviewConfigPath = argReviewConfig
  ? path.resolve(process.cwd(), argReviewConfig.replace('--review-config=', ''))
  : path.resolve(process.cwd(), 'reports', 'pilot', 'phase2-review-cadence.json');

const edgeCasesPath = argEdgeCases
  ? path.resolve(process.cwd(), argEdgeCases.replace('--edge-cases=', ''))
  : path.resolve(process.cwd(), 'reports', 'pilot', 'phase2-edge-cases.json');

function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function metric(value, suffix = '') {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return `${Number(Number(value).toFixed(2))}${suffix}`;
}

function checkMark(value) {
  return value ? 'x' : ' ';
}

fs.mkdirSync(outputDir, { recursive: true });

const csvText = fs.readFileSync(inputCsvPath, 'utf8');
const rows = parseCsvText(csvText);
const phase1Result = evaluatePhase1(rows);
const reviewCadence = readJsonFile(reviewConfigPath);
const edgeCases = readJsonFile(edgeCasesPath);
const biFeed = buildBiFeed(rows);
const readiness = evaluatePhase2Readiness({
  rows,
  reviewCadence,
  edgeCases,
  phase1Result,
});

const biFeedPath = path.join(outputDir, 'pilot-bi-feed.json');
const readinessReportPath = path.join(outputDir, 'phase2-readiness-report.md');

const biPayload = {
  generated_at: new Date().toISOString(),
  source_csv: inputCsvPath,
  cadence: reviewCadence,
  edge_cases: Array.isArray(edgeCases.edge_cases) ? edgeCases.edge_cases : edgeCases,
  records: biFeed.records,
  kpi_summary: biFeed.kpiSummary,
  checks: readiness.checks,
  phase2_ready: readiness.phase2Ready,
};

fs.writeFileSync(biFeedPath, `${JSON.stringify(biPayload, null, 2)}\n`, 'utf8');

const report = `# Phase 2 Readiness Report

Status: **${readiness.phase2Ready ? 'READY FOR PHASE 2' : 'NOT READY FOR PHASE 2'}**

## Checklist
- [${checkMark(readiness.checks.dataFeedAutomated)}] Data feed from pilot CSV automated into internal dashboard/BI
- [${checkMark(readiness.checks.weeklyRoiReviewCadence)}] Weekly ROI review cadence and owner confirmed
- [${checkMark(readiness.checks.edgeCasesDocumented)}] Approval/invoice workflow edge cases documented and assigned
- [${checkMark(readiness.checks.successThresholdsValidated)}] Success thresholds validated against go/no-go criteria

## Cadence
- Owner: ${reviewCadence.owner || 'N/A'}
- Frequency: ${reviewCadence.frequency || 'N/A'}
- Day: ${reviewCadence.day_of_week || 'N/A'}
- Time (UTC): ${reviewCadence.time_utc || 'N/A'}

## BI KPI Snapshot
- Total jobs processed: ${metric(biFeed.kpiSummary.totalJobsProcessed)}
- Admin hours delta (pilot - baseline): ${metric(biFeed.kpiSummary.adminHoursDelta)}
- Invoice turnaround delta hours (pilot - baseline): ${metric(biFeed.kpiSummary.turnaroundHoursDelta)}
- Overdue recovery delta USD (pilot - baseline): ${metric(biFeed.kpiSummary.overdueRecoveryDeltaUsd)}
- Average sentiment score: ${metric(biFeed.kpiSummary.avgSentiment)}
- Average churn-risk accounts: ${metric(biFeed.kpiSummary.avgChurnRiskAccounts)}

## Go/No-Go Validation (Phase 1)
- Phase 1 completion status: ${phase1Result.phase1Complete ? 'COMPLETE' : 'NOT COMPLETE'}
- Time-to-value: ${phase1Result.checks.timeToValue ? 'Pass' : 'Fail'}
- Accuracy: ${phase1Result.checks.accuracy ? 'Pass' : 'Fail'}
- Reliability: ${phase1Result.checks.reliability ? 'Pass' : 'Fail'}
- Financial correctness: ${phase1Result.checks.financialCorrectness ? 'Pass' : 'Fail'}
- Security baseline: ${phase1Result.checks.securityBaseline ? 'Pass' : 'Fail'}
- Pilot proof tracking: ${phase1Result.checks.pilotProofTracking ? 'Pass' : 'Fail'}
`;

fs.writeFileSync(readinessReportPath, report, 'utf8');

console.log(`Phase 2 BI feed: ${biFeedPath}`);
console.log(`Phase 2 readiness report: ${readinessReportPath}`);
