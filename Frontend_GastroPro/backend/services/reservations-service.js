import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"reservations\".\"reservations\" (id TEXT PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, people_count INTEGER NOT NULL, date DATE NOT NULL, time TEXT NOT NULL, zone TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())",
  "CREATE UNIQUE INDEX IF NOT EXISTS reservations_unique_slot ON \"reservations\".\"reservations\"(date, time, zone)"
];

const seeds = [];

await bootstrapService({
  serviceName: 'reservations-service',
  schema: 'reservations',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const table = `"${schema}"."reservations"`;

    app.get('/api/reservations', async (_req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT id, full_name AS "fullName", email, phone, people_count AS "peopleCount", date::text AS date, time, zone, created_at AS "createdAt"
           FROM ${table}
           ORDER BY date DESC, time DESC`
        );
        res.json(result.rows);
      } catch (error) {
        next(error);
      }
    });

    app.post('/api/reservations', async (req, res, next) => {
      try {
        const payload = req.body;
        const id = payload.id || `RES-${Date.now()}`;
        const result = await pool.query(
          `INSERT INTO ${table} (id, full_name, email, phone, people_count, date, time, zone)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, full_name AS "fullName", email, phone, people_count AS "peopleCount", date::text AS date, time, zone, created_at AS "createdAt"`,
          [id, payload.fullName, payload.email, payload.phone, payload.peopleCount, payload.date, payload.time, payload.zone]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        if (error.code === '23505') {
          error.statusCode = 409;
          error.message = 'La zona seleccionada ya no esta disponible en ese horario.';
        }
        next(error);
      }
    });
  },
});
