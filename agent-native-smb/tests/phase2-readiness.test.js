const { buildBiFeed, evaluatePhase2Readiness } = require('../src/phase2-readiness');
const { parseCsvText, evaluatePhase1 } = require('../src/pilot-phase1');

describe('phase2 readiness', () => {
  const csv = [
    'week,period_start,period_end,active_operators,jobs_processed,first_invoice_minutes_from_setup,parsed_accuracy_pct,admin_hours_baseline,admin_hours_pilot,invoice_turnaround_hours_baseline,invoice_turnaround_hours_pilot,overdue_recovery_baseline_usd,overdue_recovery_pilot_usd,api_success_rate_pct,invoice_totals_correct_pct,security_baseline_verified,nps_or_cs_score,churn_risk_accounts',
    '1,2026-05-04,2026-05-10,6,18,4.4,96.1,18,10,48,16,2100,2850,99.3,100,true,52,2',
    '2,2026-05-11,2026-05-17,7,23,3.8,97.2,19,9,46,14,2200,3000,99.5,100,yes,55,1',
    '3,2026-05-18,2026-05-24,7,25,3.6,96.8,20,9,44,12,2300,3180,99.4,100,verified,57,1',
  ].join('\n');

  test('marks phase2 as ready when all checks pass', () => {
    const rows = parseCsvText(csv);
    const phase1Result = evaluatePhase1(rows);
    const bi = buildBiFeed(rows);
    const result = evaluatePhase2Readiness({
      rows,
      phase1Result,
      reviewCadence: {
        owner: 'pilot-ops-lead',
        frequency: 'weekly',
        day_of_week: 'Monday',
        time_utc: '16:00',
      },
      edgeCases: [
        { case_id: 'EC-001', scenario: 'Unknown SKU', owner: 'billing-engineering', status: 'mitigation-defined' },
      ],
    });

    expect(bi.records).toHaveLength(3);
    expect(result.phase2Ready).toBe(true);
    expect(result.checks).toEqual({
      dataFeedAutomated: true,
      weeklyRoiReviewCadence: true,
      edgeCasesDocumented: true,
      successThresholdsValidated: true,
    });
  });

  test('marks phase2 as not ready when cadence or edge-case ownership is missing', () => {
    const rows = parseCsvText(csv);
    const phase1Result = evaluatePhase1(rows);
    const result = evaluatePhase2Readiness({
      rows,
      phase1Result,
      reviewCadence: {
        owner: '',
        frequency: 'weekly',
        day_of_week: 'Monday',
        time_utc: '16:00',
      },
      edgeCases: [{ case_id: 'EC-001', scenario: 'Unknown SKU', owner: '', status: 'mitigation-defined' }],
    });

    expect(result.phase2Ready).toBe(false);
    expect(result.checks.weeklyRoiReviewCadence).toBe(false);
    expect(result.checks.edgeCasesDocumented).toBe(false);
  });
});
