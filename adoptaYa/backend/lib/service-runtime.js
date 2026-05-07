import cors from 'cors';
import express from 'express';
import { Pool } from 'pg';

function buildInsertStatement(schema, table, columns, rowCount) {
  const placeholders = [];
  let index = 1;

  for (let row = 0; row < rowCount; row += 1) {
    const rowPlaceholders = [];

    for (let column = 0; column < columns.length; column += 1) {
      rowPlaceholders.push(`$${index}`);
      index += 1;
    }

    placeholders.push(`(${rowPlaceholders.join(', ')})`);
  }

  return `INSERT INTO "${schema}"."${table}" (${columns.join(', ')}) VALUES ${placeholders.join(', ')}`;
}

async function seedTable(pool, schema, seed) {
  if (!seed || !seed.table || !seed.columns || !seed.rows || !seed.rows.length) {
    return;
  }

  const existing = await pool.query(`SELECT COUNT(*)::int AS total FROM "${schema}"."${seed.table}"`);
  if (existing.rows[0].total > 0) {
    return;
  }

  const sql = buildInsertStatement(schema, seed.table, seed.columns, seed.rows.length);
  const values = seed.rows.flat();
  await pool.query(sql, values);
}

export function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function bootstrapService(config) {
  const {
    serviceName,
    schema,
    setupStatements = [],
    seeds = [],
    registerRoutes,
  } = config;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const port = Number(process.env.PORT || 3000);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, service: serviceName });
    } catch (error) {
      res.status(500).json({ ok: false, service: serviceName, message: 'Database unavailable' });
    }
  });

  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

  for (const statement of setupStatements) {
    await pool.query(statement);
  }

  for (const seed of seeds) {
    await seedTable(pool, schema, seed);
  }

  registerRoutes({ app, pool, schema });

  app.use((error, _req, res, _next) => {
    console.error(`[${serviceName}]`, error);
    res.status(error.statusCode || 500).json({
      ok: false,
      service: serviceName,
      message: error.message || 'Unexpected error',
    });
  });

  app.listen(port, () => {
    console.log(`${serviceName} listening on port ${port}`);
  });
}
