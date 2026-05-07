import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"adoption_contact\".\"messages\" (id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, correo TEXT NOT NULL, mensaje TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())"
];

const seeds = [];

await bootstrapService({
  serviceName: 'adoption-contact-service',
  schema: 'adoption_contact',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const table = `"${schema}"."messages"`;

    app.post('/api/contact/messages', async (req, res, next) => {
      try {
        const { nombre, correo, mensaje } = req.body;
        const result = await pool.query(
          `INSERT INTO ${table} (nombre, correo, mensaje)
           VALUES ($1, $2, $3)
           RETURNING id, nombre, correo, mensaje, created_at AS "createdAt"`,
          [nombre, correo, mensaje]
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        next(error);
      }
    });
  },
});
