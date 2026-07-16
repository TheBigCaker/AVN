const express = require('express');
const { randomUUID } = require('node:crypto');
const rateLimit = require('express-rate-limit');
const defaultDb = require('./db');
const { buildPartQuantities, calculateInvoiceTotals, roundMoney } = require('./invoice');

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function authDisabled() {
  return process.env.API_AUTH_DISABLED === 'true';
}

function requireRole(role) {
  return (req, res, next) => {
    if (authDisabled()) {
      return next();
    }
    if (req.get('x-api-role') !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

function requireEngineAuth(req, res, next) {
  if (authDisabled()) {
    return next();
  }
  const expected = process.env.INTERNAL_ENGINE_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'Engine auth not configured' });
  }
  if (req.get('x-internal-token') !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

function createApp(db = defaultDb) {
  const app = express();
  app.use(express.json());
  const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.API_WRITE_MAX_PER_MINUTE) || 60,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const readLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.API_READ_MAX_PER_MINUTE) || 240,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.post('/api/field/log-work', writeLimiter, requireRole('tech'), async (req, res, next) => {
    const { job_id: jobId, audio_file_url: audioFileUrl, raw_transcript: rawTranscript, field_log_id: fieldLogId } = req.body;

    if (!jobId || !audioFileUrl) {
      return res.status(400).json({ error: 'job_id and audio_file_url are required' });
    }
    if (!isUuid(jobId)) {
      return res.status(400).json({ error: 'job_id must be a UUID' });
    }
    if (fieldLogId && !isUuid(fieldLogId)) {
      return res.status(400).json({ error: 'field_log_id must be a UUID when provided' });
    }

    const client = await db.getPool().connect();

    try {
      await client.query('BEGIN');

      const jobResult = await client.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
      if (jobResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Job not found' });
      }

      const insertedId = fieldLogId || randomUUID();
      await client.query(
        `INSERT INTO field_logs (id, job_id, audio_file_url, raw_transcript)
         VALUES ($1, $2, $3, $4)`,
        [insertedId, jobId, audioFileUrl, rawTranscript || null]
      );

      await client.query(
        `UPDATE jobs
         SET status = 'NEEDS_REVIEW'
         WHERE id = $1`,
        [jobId]
      );

      await client.query('COMMIT');
      return res.status(201).json({
        field_log_id: insertedId,
        job_id: jobId,
        status: 'NEEDS_REVIEW',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  });

  app.post('/api/engine/process-audio', writeLimiter, requireEngineAuth, async (req, res, next) => {
    const {
      field_log_id: fieldLogId,
      raw_transcript: rawTranscript,
      ai_parsed_data: aiParsedData,
      ai_confidence_score: aiConfidenceScore,
    } = req.body;

    if (!fieldLogId || !aiParsedData) {
      return res.status(400).json({ error: 'field_log_id and ai_parsed_data are required' });
    }
    if (!isUuid(fieldLogId)) {
      return res.status(400).json({ error: 'field_log_id must be a UUID' });
    }
    if (typeof aiParsedData !== 'object' || Array.isArray(aiParsedData)) {
      return res.status(400).json({ error: 'ai_parsed_data must be an object' });
    }
    if (aiConfidenceScore != null) {
      const confidence = Number(aiConfidenceScore);
      if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
        return res.status(400).json({ error: 'ai_confidence_score must be between 0 and 1' });
      }
    }

    try {
      const result = await db.query(
        `UPDATE field_logs
         SET raw_transcript = COALESCE($2, raw_transcript),
             ai_parsed_data = $3::jsonb,
             ai_confidence_score = $4
         WHERE id = $1
         RETURNING id, job_id, ai_confidence_score, created_at`,
        [fieldLogId, rawTranscript || null, JSON.stringify(aiParsedData), aiConfidenceScore || null]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Field log not found' });
      }

      return res.status(200).json({
        field_log_id: result.rows[0].id,
        job_id: result.rows[0].job_id,
        ai_confidence_score: result.rows[0].ai_confidence_score,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get('/api/admin/review-queue', readLimiter, requireRole('admin'), async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT
            j.id,
            j.customer_id,
            j.tech_id,
            j.status,
            j.created_at,
            fl.id AS field_log_id,
            fl.audio_file_url,
            fl.raw_transcript,
            fl.ai_parsed_data,
            fl.ai_confidence_score,
            fl.created_at AS field_log_created_at
         FROM jobs j
         LEFT JOIN LATERAL (
            SELECT *
            FROM field_logs f
            WHERE f.job_id = j.id
            ORDER BY f.created_at DESC
            LIMIT 1
         ) fl ON true
         WHERE j.status = 'NEEDS_REVIEW'
         ORDER BY j.created_at ASC`
      );

      return res.status(200).json({ jobs: result.rows });
    } catch (error) {
      return next(error);
    }
  });

  app.post('/api/admin/approve-and-invoice', writeLimiter, requireRole('admin'), async (req, res, next) => {
    const {
      job_id: jobId,
      field_log_id: fieldLogId,
      labor_rate: laborRate = 100,
      due_date: dueDate,
      stripe_payment_link: stripePaymentLink,
    } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'job_id is required' });
    }
    if (!isUuid(jobId)) {
      return res.status(400).json({ error: 'job_id must be a UUID' });
    }
    if (fieldLogId && !isUuid(fieldLogId)) {
      return res.status(400).json({ error: 'field_log_id must be a UUID when provided' });
    }

    if (Number(laborRate) < 0) {
      return res.status(400).json({ error: 'labor_rate must be non-negative' });
    }
    if (dueDate && !isValidDateOnly(dueDate)) {
      return res.status(400).json({ error: 'due_date must be YYYY-MM-DD' });
    }

    const client = await db.getPool().connect();

    try {
      await client.query('BEGIN');

      const jobResult = await client.query('SELECT id, customer_id FROM jobs WHERE id = $1', [jobId]);
      if (jobResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Job not found' });
      }

      const fieldLogResult = await client.query(
        `SELECT id, ai_parsed_data
         FROM field_logs
         WHERE job_id = $1
           AND ($2::uuid IS NULL OR id = $2::uuid)
         ORDER BY created_at DESC
         LIMIT 1`,
        [jobId, fieldLogId || null]
      );

      if (fieldLogResult.rowCount === 0 || !fieldLogResult.rows[0].ai_parsed_data) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'No AI parsed data available for invoicing' });
      }

      const parsedData = fieldLogResult.rows[0].ai_parsed_data;
      const hours = Math.max(0, Number(parsedData.hours) || 0);
      const quantityBySku = buildPartQuantities(parsedData.parts);

      const skus = [...quantityBySku.keys()];
      let partRows = [];
      if (skus.length > 0) {
        const partsResult = await client.query(
          `SELECT sku, retail_price
           FROM parts_inventory
           WHERE sku = ANY($1::text[])`,
          [skus]
        );

        partRows = partsResult.rows;
        const foundSkus = new Set(partRows.map((row) => row.sku));
        const missingSkus = skus.filter((sku) => !foundSkus.has(sku));
        if (missingSkus.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Unknown parts SKU(s): ${missingSkus.join(', ')}` });
        }
      }

      const { totalLabor, totalParts, grandTotal } = calculateInvoiceTotals({
        hours,
        laborRate,
        partRows,
        quantityBySku,
      });

      const invoiceId = randomUUID();
      const paymentLink = stripePaymentLink || `https://pay.example.com/invoice/${invoiceId}`;

      await client.query(
        `INSERT INTO invoices (
            id, job_id, customer_id, total_labor, total_parts, grand_total,
            status, stripe_payment_link, due_date, last_reminder_sent_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'SENT', $7, $8, CURRENT_TIMESTAMP)`,
        [
          invoiceId,
          jobId,
          jobResult.rows[0].customer_id,
          totalLabor,
          totalParts,
          grandTotal,
          paymentLink,
          dueDate || null,
        ]
      );

      for (const row of partRows) {
        await client.query(
          `INSERT INTO invoice_line_items (id, invoice_id, sku, quantity, price_charged)
           VALUES ($1, $2, $3, $4, $5)`,
          [randomUUID(), invoiceId, row.sku, quantityBySku.get(row.sku), roundMoney(Number(row.retail_price))]
        );
      }

      await client.query(`UPDATE jobs SET status = 'INVOICED' WHERE id = $1`, [jobId]);

      await client.query('COMMIT');

      return res.status(201).json({
        invoice_id: invoiceId,
        job_id: jobId,
        status: 'SENT',
        total_labor: totalLabor,
        total_parts: totalParts,
        grand_total: grandTotal,
        stripe_payment_link: paymentLink,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = {
  createApp,
};
