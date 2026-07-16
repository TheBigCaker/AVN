const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const request = require('supertest');
const { createApp } = require('../src/app');

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('Postgres E2E flow', () => {
  let pool;
  let app;

  beforeAll(async () => {
    process.env.API_AUTH_DISABLED = 'true';
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const schemaSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');

    await pool.query(`
      DROP TABLE IF EXISTS invoice_line_items;
      DROP TABLE IF EXISTS invoices;
      DROP TABLE IF EXISTS field_logs;
      DROP TABLE IF EXISTS jobs;
      DROP TABLE IF EXISTS parts_inventory;
      DROP TABLE IF EXISTS customers;
    `);
    await pool.query(schemaSql);
    await pool.query(seedSql);

    app = createApp({
      getPool: () => pool,
      query: (text, params) => pool.query(text, params),
    });
  });

  afterAll(async () => {
    delete process.env.API_AUTH_DISABLED;
    if (pool) {
      await pool.end();
    }
  });

  test('runs log-work to invoice flow against real Postgres', async () => {
    const logResponse = await request(app).post('/api/field/log-work').send({
      job_id: '33333333-3333-3333-3333-333333333333',
      audio_file_url: 'https://example-bucket.local/audio/job-3333-new.wav',
      raw_transcript: 'Did 1.5 hours and used SKU-882 twice',
    });
    expect(logResponse.status).toBe(201);

    const processResponse = await request(app).post('/api/engine/process-audio').send({
      field_log_id: logResponse.body.field_log_id,
      ai_parsed_data: {
        hours: 1.5,
        parts: [{ sku: 'SKU-882', quantity: 2 }],
      },
      ai_confidence_score: 0.97,
    });
    expect(processResponse.status).toBe(200);

    const queueResponse = await request(app).get('/api/admin/review-queue');
    expect(queueResponse.status).toBe(200);
    expect(queueResponse.body.jobs.some((job) => job.id === '33333333-3333-3333-3333-333333333333')).toBe(true);

    const invoiceResponse = await request(app).post('/api/admin/approve-and-invoice').send({
      job_id: '33333333-3333-3333-3333-333333333333',
      labor_rate: 100,
      due_date: '2026-06-30',
    });

    expect(invoiceResponse.status).toBe(201);
    expect(invoiceResponse.body.total_labor).toBe(150);
    expect(invoiceResponse.body.total_parts).toBe(90);
    expect(invoiceResponse.body.grand_total).toBe(240);
  });
});
