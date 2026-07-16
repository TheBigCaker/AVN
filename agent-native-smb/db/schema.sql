CREATE TABLE customers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    billing_address TEXT
);

CREATE TABLE parts_inventory (
    sku VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    unit_cost DECIMAL(10, 2) NOT NULL,
    retail_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    tech_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_FIELD', 'NEEDS_REVIEW', 'INVOICED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE field_logs (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    audio_file_url TEXT NOT NULL,
    raw_transcript TEXT,
    ai_parsed_data JSONB,
    ai_confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    customer_id UUID REFERENCES customers(id),
    total_labor DECIMAL(10, 2),
    total_parts DECIMAL(10, 2),
    grand_total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'OVERDUE_TIER_1', 'OVERDUE_TIER_2', 'PAID')),
    stripe_payment_link TEXT,
    due_date DATE,
    last_reminder_sent_at TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    sku VARCHAR(100) REFERENCES parts_inventory(sku),
    quantity INT NOT NULL DEFAULT 1,
    price_charged DECIMAL(10, 2)
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_field_logs_job_id_created_at ON field_logs(job_id, created_at DESC);
CREATE INDEX idx_invoices_status_due_date ON invoices(status, due_date);
