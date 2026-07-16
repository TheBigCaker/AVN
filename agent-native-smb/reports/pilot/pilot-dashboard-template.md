# Pilot ROI Dashboard Template (2-3 Weeks)

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
`npm run pilot:report -- --input-csv=/absolute/path/to/pilot-roi.csv`

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
