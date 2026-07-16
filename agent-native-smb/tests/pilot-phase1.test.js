const { parseCsvText, evaluatePhase1 } = require('../src/pilot-phase1');

describe('pilot phase 1 evaluation', () => {
  test('evaluates phase 1 as complete when all thresholds pass', () => {
    const csv = [
      'week,jobs_processed,first_invoice_minutes_from_setup,parsed_accuracy_pct,admin_hours_baseline,admin_hours_pilot,invoice_turnaround_hours_baseline,invoice_turnaround_hours_pilot,overdue_recovery_baseline_usd,overdue_recovery_pilot_usd,api_success_rate_pct,invoice_totals_correct_pct,security_baseline_verified,nps_or_cs_score,churn_risk_accounts',
      '1,12,4.5,96,15,8,48,12,2000,2600,99.2,100,true,52,1',
      '2,15,3.9,97,16,8,44,10,2100,2750,99.5,100,yes,55,1',
      '3,14,4.1,95,14,7,42,9,2050,2800,99.1,100,verified,57,0',
    ].join('\n');

    const rows = parseCsvText(csv);
    const result = evaluatePhase1(rows);

    expect(result.phase1Complete).toBe(true);
    expect(result.checks).toEqual({
      timeToValue: true,
      accuracy: true,
      reliability: true,
      financialCorrectness: true,
      securityBaseline: true,
      pilotProofTracking: true,
    });
  });

  test('evaluates phase 1 as incomplete when thresholds are not met', () => {
    const csv = [
      'week,jobs_processed,first_invoice_minutes_from_setup,parsed_accuracy_pct,admin_hours_baseline,admin_hours_pilot,invoice_turnaround_hours_baseline,invoice_turnaround_hours_pilot,overdue_recovery_baseline_usd,overdue_recovery_pilot_usd,api_success_rate_pct,invoice_totals_correct_pct,security_baseline_verified,nps_or_cs_score,churn_risk_accounts',
      '1,10,7.5,90,14,11,48,30,1900,2000,97,98,false,40,3',
      '2,11,6.2,92,13,10,46,26,1850,1980,97.5,99,no,42,2',
    ].join('\n');

    const rows = parseCsvText(csv);
    const result = evaluatePhase1(rows);

    expect(result.phase1Complete).toBe(false);
    expect(result.checks.timeToValue).toBe(false);
    expect(result.checks.accuracy).toBe(false);
    expect(result.checks.reliability).toBe(false);
    expect(result.checks.financialCorrectness).toBe(false);
    expect(result.checks.securityBaseline).toBe(false);
  });
});
