#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/db-run.js <sql-file>');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const result = spawnSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-f', file], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status || 0);
