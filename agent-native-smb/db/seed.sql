-- Deterministic sample data for local end-to-end testing

INSERT INTO customers (id, name, phone, email, billing_address)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Bakery', '+1-555-0100', 'ops@acmebakery.test', '101 Main St, Springfield'),
  ('22222222-2222-2222-2222-222222222222', 'Northside Clinic', '+1-555-0200', 'manager@northside.test', '205 Elm St, Springfield')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    billing_address = EXCLUDED.billing_address;

INSERT INTO parts_inventory (sku, name, unit_cost, retail_price)
VALUES
  ('SKU-44B', 'Compressor 44B', 110.00, 180.00),
  ('SKU-882', 'Contactor 882', 25.00, 45.00),
  ('SKU-FLTR', 'Air Filter', 7.00, 18.00)
ON CONFLICT (sku) DO UPDATE
SET name = EXCLUDED.name,
    unit_cost = EXCLUDED.unit_cost,
    retail_price = EXCLUDED.retail_price;

INSERT INTO jobs (id, customer_id, tech_id, status)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SCHEDULED'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'NEEDS_REVIEW')
ON CONFLICT (id) DO UPDATE
SET customer_id = EXCLUDED.customer_id,
    tech_id = EXCLUDED.tech_id,
    status = EXCLUDED.status;

INSERT INTO field_logs (id, job_id, audio_file_url, raw_transcript, ai_parsed_data, ai_confidence_score)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'https://example-bucket.local/audio/job-4444.wav',
  'Replaced compressor, took two hours, used part number SKU-44B, customer said system is cooling again.',
  '{"hours":2,"parts":[{"sku":"SKU-44B","quantity":1}],"summary":"Replaced compressor and verified cooling."}'::jsonb,
  0.93
)
ON CONFLICT (id) DO UPDATE
SET job_id = EXCLUDED.job_id,
    audio_file_url = EXCLUDED.audio_file_url,
    raw_transcript = EXCLUDED.raw_transcript,
    ai_parsed_data = EXCLUDED.ai_parsed_data,
    ai_confidence_score = EXCLUDED.ai_confidence_score;
