# Agent-Native-SMB

Minimal API implementation for the **Field-to-Bank** workflow.

## Included

- PostgreSQL relational + JSONB schema (`db/schema.sql`)
- Seed data for immediate local testing (`db/seed.sql`)
- Role/token auth checks for tech/admin/internal engine routes
- Rate limits for write endpoints
- Endpoints:
  - `POST /api/field/log-work`
  - `POST /api/engine/process-audio`
  - `GET /api/admin/review-queue`
  - `POST /api/admin/approve-and-invoice`

## Local quickstart (Postgres + API)

```bash
npm install
export DATABASE_URL=******localhost:5432/agent_native_smb
export INTERNAL_ENGINE_TOKEN=local-engine-token
npm run db:init
npm start
```

### Optional: run schema/seed separately

```bash
npm run db:schema
npm run db:seed
```

## Auth model (MVP)

- `POST /api/field/log-work` requires header: `x-api-role: tech`
- `GET /api/admin/review-queue` and `POST /api/admin/approve-and-invoice` require: `x-api-role: admin`
- `POST /api/engine/process-audio` requires: `x-internal-token: <INTERNAL_ENGINE_TOKEN>`

For local-only testing, you can bypass auth:

```bash
export API_AUTH_DISABLED=true
```

## Seeded records (for immediate API exercise)

- `jobs.id = 33333333-3333-3333-3333-333333333333` (`SCHEDULED`)
- `jobs.id = 44444444-4444-4444-4444-444444444444` (`NEEDS_REVIEW`, with parsed field log)
- Sample parts: `SKU-44B`, `SKU-882`, `SKU-FLTR`

## Example endpoint flow

### 1) Field tech logs work (moves job to `NEEDS_REVIEW`)

```bash
curl -X POST http://localhost:3000/api/field/log-work \
  -H 'content-type: application/json' \
  -H 'x-api-role: tech' \
  -d '{
    "job_id":"33333333-3333-3333-3333-333333333333",
    "audio_file_url":"https://example-bucket.local/audio/job-3333.wav",
    "raw_transcript":"Replaced contactor and filter, took 1.5 hours"
  }'
```

### 2) Internal engine writes AI output

```bash
curl -X POST http://localhost:3000/api/engine/process-audio \
  -H 'content-type: application/json' \
  -H 'x-internal-token: local-engine-token' \
  -d '{
    "field_log_id":"55555555-5555-5555-5555-555555555555",
    "ai_parsed_data":{"hours":2,"parts":[{"sku":"SKU-44B","quantity":1}]},
    "ai_confidence_score":0.95
  }'
```

### 3) Admin reads review queue

```bash
curl http://localhost:3000/api/admin/review-queue \
  -H 'x-api-role: admin'
```

### 4) Admin approves and invoices

```bash
curl -X POST http://localhost:3000/api/admin/approve-and-invoice \
  -H 'content-type: application/json' \
  -H 'x-api-role: admin' \
  -d '{
    "job_id":"44444444-4444-4444-4444-444444444444",
    "labor_rate":95,
    "due_date":"2026-06-30"
  }'
```

## Market-readiness go/no-go checklist

Ship only when all pass:

- Time-to-value: first invoice in under 5 minutes from setup
- Accuracy: parsed labor/parts correctness >= 95% on pilot jobs
- Reliability: API success rate >= 99% on normal load
- Financial correctness: totals match approved labor + parts
- Security baseline: auth, rate limits, validation, secret handling verified

Pilot proof targets (5-10 operators, 2-3 weeks):

- Daily admin time saved
- Invoice turnaround improvement
- Overdue recovery improvement
- Weekly NPS/churn intent

## Test

```bash
npm test
npm run test:e2e   # requires DATABASE_URL
```

## Pilot ROI report templates

Generate a 2-3 week pilot ROI tracking pack (CSV + dashboard/checklist template):

```bash
npm run pilot:report
```

This writes:

- `reports/pilot/pilot-roi-template.csv`
- `reports/pilot/pilot-roi-qualified-sample.csv` (repo-owned benchmark sample that passes phase 1)
- `reports/pilot/pilot-dashboard-template.md` (includes phase 1 completion + phase 2/3 readiness checklists)

Optional output location:

```bash
npm run pilot:report -- --out-dir=/absolute/path/to/output
```

To implement/score phase 1 from real pilot data, pass a filled CSV:

```bash
npm run pilot:report -- --input-csv=/absolute/path/to/pilot-roi.csv
```

This additionally writes:

- `reports/pilot/phase1-completion-report.md` with COMPLETE / NOT COMPLETE status against phase 1 thresholds.

To run qualification immediately from repository benchmark data:

```bash
npm run phase1:qualify
```

## Phase 2 setup

Automate Phase 2 readiness artifacts from repository-owned benchmark data:

```bash
npm run phase2:setup
```

This writes:

- `reports/pilot/pilot-bi-feed.json` (dashboard/BI-ready structured feed)
- `reports/pilot/phase2-readiness-report.md` (READY / NOT READY status against Phase 2 checklist)

Configuration inputs used by the setup command:

- `reports/pilot/phase2-review-cadence.json` (weekly review owner + cadence)
- `reports/pilot/phase2-edge-cases.json` (approval/invoice edge cases with assigned owners)
