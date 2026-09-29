// Shared PostgreSQL pool factory (local + hosted).
// Local dev: plain DATABASE_URL (e.g. postgres://...@localhost:5432/db) — no SSL.
// Hosted (Vercel / Neon / Supabase / RDS): providers require TLS, so enable SSL
// when the URL asks for it (sslmode=require), PGSSL=true, or NODE_ENV=production
// against a NON-local host. Localhost is never forced to SSL (avoids boot hangs).
// IMPORTANT: no pool is created at import time — Vercel imports this file on every
// cold start, and `new Pool()` with an undefined connectionString throws, which
// turns into a 500 on EVERY route (even /api/health). Use getPool() lazily.
const { Pool } = require('pg');

function isLocalHost(url) {
  if (!url) return true;
  try {
    const u = new URL(url.replace(/^postgres:\/\//i, 'http://'));
    return ['localhost', '127.0.0.1', '::1'].includes(u.hostname);
  } catch (e) {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function needsSSL(url) {
  if (!url) return false;
  if (process.env.PGSSL === 'true') return true;
  if (process.env.PGSSL === 'false') return false;
  if (/sslmode=require/i.test(url)) return true;
  if (isLocalHost(url)) return false; // never force TLS to a local DB
  if (process.env.NODE_ENV === 'production') return true;
  return false;
}

function createPool(url) {
  const connectionString = url || process.env.DATABASE_URL;
  if (!connectionString) {
    // No Pool: callers must return a "database is not configured" 500 instead of crashing.
    return null;
  }
  const pool = new Pool(
    needsSSL(connectionString)
      ? { connectionString, ssl: { rejectUnauthorized: false } }
      : { connectionString }
  );
  pool.on('error', (err) => console.error('PG pool error:', err.message));
  return pool;
}

// Lazy singleton (serverless-friendly: reused across warm invocations, but never
// constructed at import time — see note above). Returns null when DATABASE_URL
// is not configured on the deployment.
let __pool = null;
function getPool() {
  if (!__pool) __pool = createPool();
  return __pool;
}

// Back-compat `pool` export: files do `const { pool } = require('../lib/db')`.
// A Proxy defers pool creation until first `pool.query(...)` call, so importing
// never crashes Vercel cold starts. Without DATABASE_URL, the first query throws
// a clear "database is not configured" error that routes turn into a 500 JSON.
const pool = new Proxy(
  {},
  {
    get(_t, prop) {
      const p = getPool();
      if (!p) {
        if (prop === 'isUnconfigured') return true;
        throw new Error(
          'DATABASE_URL is not set. Add a hosted Postgres DATABASE_URL in Vercel env vars.'
        );
      }
      const v = p[prop];
      return typeof v === 'function' ? v.bind(p) : v;
    },
  }
);

module.exports = { pool, createPool, getPool, needsSSL };

