const request = require('supertest');
const { createApp } = require('../src/app');

const IDS = {
  job: '33333333-3333-4333-8333-333333333333',
  fieldLog: '55555555-5555-4555-8555-555555555555',
};

function makeDbWithClient(client) {
  return {
    getPool: () => ({
      connect: jest.fn().mockResolvedValue(client),
    }),
    query: jest.fn(),
  };
}

describe('API endpoints', () => {
  beforeEach(() => {
    process.env.INTERNAL_ENGINE_TOKEN = 'test-engine-token';
    delete process.env.API_AUTH_DISABLED;
  });

  test('POST /api/field/log-work requires tech role', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    const app = createApp(makeDbWithClient(client));

    const response = await request(app)
      .post('/api/field/log-work')
      .send({ job_id: IDS.job, audio_file_url: 'https://bucket/audio.wav' });

    expect(response.status).toBe(403);
  });

  test('POST /api/field/log-work creates log and marks job as NEEDS_REVIEW', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: IDS.job }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({}),
      release: jest.fn(),
    };

    const app = createApp(makeDbWithClient(client));
    const response = await request(app)
      .post('/api/field/log-work')
      .set('x-api-role', 'tech')
      .send({ job_id: IDS.job, audio_file_url: 'https://bucket/audio.wav' });

    expect(response.status).toBe(201);
    expect(response.body.job_id).toBe(IDS.job);
    expect(response.body.status).toBe('NEEDS_REVIEW');
    expect(client.query).toHaveBeenNthCalledWith(4, expect.stringContaining("SET status = 'NEEDS_REVIEW'"), [IDS.job]);
  });

  test('POST /api/engine/process-audio validates confidence score range', async () => {
    const db = {
      getPool: () => ({ connect: jest.fn() }),
      query: jest.fn(),
    };

    const app = createApp(db);
    const response = await request(app)
      .post('/api/engine/process-audio')
      .set('x-internal-token', 'test-engine-token')
      .send({ field_log_id: IDS.fieldLog, ai_parsed_data: { hours: 2 }, ai_confidence_score: 2.5 });

    expect(response.status).toBe(400);
  });

  test('POST /api/engine/process-audio returns 404 for missing field log', async () => {
    const db = {
      getPool: () => ({ connect: jest.fn() }),
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
    };

    const app = createApp(db);
    const response = await request(app)
      .post('/api/engine/process-audio')
      .set('x-internal-token', 'test-engine-token')
      .send({ field_log_id: IDS.fieldLog, ai_parsed_data: { hours: 2 } });

    expect(response.status).toBe(404);
  });

  test('GET /api/admin/review-queue returns NEEDS_REVIEW jobs', async () => {
    const db = {
      getPool: () => ({ connect: jest.fn() }),
      query: jest.fn().mockResolvedValue({ rows: [{ id: IDS.job, status: 'NEEDS_REVIEW' }] }),
    };

    const app = createApp(db);
    const response = await request(app)
      .get('/api/admin/review-queue')
      .set('x-api-role', 'admin');

    expect(response.status).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
    expect(response.body.jobs[0].status).toBe('NEEDS_REVIEW');
  });

  test('POST /api/admin/approve-and-invoice validates due_date format', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    const app = createApp(makeDbWithClient(client));

    const response = await request(app)
      .post('/api/admin/approve-and-invoice')
      .set('x-api-role', 'admin')
      .send({ job_id: IDS.job, due_date: '06/30/2026' });

    expect(response.status).toBe(400);
  });

  test('POST /api/admin/approve-and-invoice computes totals and creates invoice', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: IDS.job, customer_id: '11111111-1111-4111-8111-111111111111' }] })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ id: IDS.fieldLog, ai_parsed_data: { hours: 2, parts: [{ sku: 'P-1', quantity: 2 }] } }],
        })
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ sku: 'P-1', retail_price: '50.00' }],
        })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({}),
      release: jest.fn(),
    };

    const app = createApp(makeDbWithClient(client));

    const response = await request(app)
      .post('/api/admin/approve-and-invoice')
      .set('x-api-role', 'admin')
      .send({ job_id: IDS.job, labor_rate: 75, due_date: '2026-06-30' });

    expect(response.status).toBe(201);
    expect(response.body.total_labor).toBe(150);
    expect(response.body.total_parts).toBe(100);
    expect(response.body.grand_total).toBe(250);
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE jobs SET status = 'INVOICED'"), [IDS.job]);
  });
});
