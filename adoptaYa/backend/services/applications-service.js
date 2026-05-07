import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"applications\".\"applications\" (id SERIAL PRIMARY KEY, applicant_name TEXT NOT NULL, email TEXT NOT NULL, pet_id INTEGER NOT NULL, pet_name TEXT NOT NULL, pet_species TEXT, experience TEXT NOT NULL, home_evidence TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'En revision', date DATE NOT NULL DEFAULT CURRENT_DATE, UNIQUE(email, pet_id))"
];

const seeds = [];

await bootstrapService({
  serviceName: 'applications-service',
  schema: 'applications',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const table = `"${schema}"."applications"`;

    app.get('/api/applications', async (_req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT id, applicant_name AS "applicantName", email, pet_id AS "petId", pet_name AS "petName", pet_species AS "petSpecies", experience, home_evidence AS "homeEvidence", status, date::text AS date
           FROM ${table}
           ORDER BY id DESC`
        );
        res.json(result.rows);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/applications/stats', async (_req, res, next) => {
      try {
        const result = await pool.query(
          `SELECT
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'Aprobada')::int AS approved,
              COUNT(*) FILTER (WHERE status = 'En revision')::int AS pending,
              COUNT(*) FILTER (WHERE status = 'Rechazada')::int AS rejected,
              COUNT(*) FILTER (WHERE status = 'Aprobada' AND pet_species = 'Perro')::int AS "dogAdoptions",
              COUNT(*) FILTER (WHERE status = 'Aprobada' AND pet_species = 'Gato')::int AS "catAdoptions"
           FROM ${table}`
        );
        res.json(result.rows[0]);
      } catch (error) {
        next(error);
      }
    });

    app.post('/api/applications', async (req, res, next) => {
      try {
        const payload = req.body;
        const result = await pool.query(
          `INSERT INTO ${table} (applicant_name, email, pet_id, pet_name, pet_species, experience, home_evidence, status, date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
           RETURNING id, applicant_name AS "applicantName", email, pet_id AS "petId", pet_name AS "petName", pet_species AS "petSpecies", experience, home_evidence AS "homeEvidence", status, date::text AS date`,
          [payload.applicantName, payload.email, payload.petId, payload.petName, payload.petSpecies || null, payload.experience, payload.homeEvidence, payload.status || 'En revision']
        );
        res.status(201).json(result.rows[0]);
      } catch (error) {
        if (error.code === '23505') {
          error.statusCode = 409;
          error.message = 'La persona ya tiene una postulacion para esta mascota.';
        }
        next(error);
      }
    });

    app.patch('/api/applications/:id/status', async (req, res, next) => {
      try {
        const result = await pool.query(
          `UPDATE ${table}
           SET status = $1
           WHERE id = $2
           RETURNING id, applicant_name AS "applicantName", email, pet_id AS "petId", pet_name AS "petName", pet_species AS "petSpecies", experience, home_evidence AS "homeEvidence", status, date::text AS date`,
          [req.body.status || 'En revision', req.params.id]
        );
        res.json(result.rows[0] || null);
      } catch (error) {
        next(error);
      }
    });

    app.delete('/api/applications/:id', async (req, res, next) => {
      try {
        await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    });
  },
});
