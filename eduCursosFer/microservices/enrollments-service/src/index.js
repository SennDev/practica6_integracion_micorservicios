import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

const PORT = Number(process.env.PORT ?? 3002);
const COURSES_SERVICE_URL = process.env.COURSES_SERVICE_URL ?? 'http://localhost:3001';
const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'educursos',
  password: process.env.DB_PASSWORD ?? 'educursos123',
  database: process.env.DB_NAME ?? 'enrollments_db',
});

app.use(cors());
app.use(express.json());

async function waitForDatabase(action, retries = 15, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      console.warn(`enrollments-service: reintentando conexion a BD (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function initializeDatabase() {
  await waitForDatabase(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        nombre_estudiante VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        curso_id INTEGER NOT NULL,
        curso_nombre VARCHAR(150) NOT NULL,
        modalidad VARCHAR(50) NOT NULL,
        comentarios TEXT NOT NULL DEFAULT '',
        estado VARCHAR(20) NOT NULL DEFAULT 'Registrado',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_student_course UNIQUE (email, curso_id)
      )
    `);
  });
}

function normalizeEnrollment(row) {
  return {
    id: row.id,
    codigo: row.codigo,
    nombreEstudiante: row.nombreEstudiante,
    email: row.email,
    cursoId: row.cursoId,
    cursoNombre: row.cursoNombre,
    modalidad: row.modalidad,
    comentarios: row.comentarios,
    estado: row.estado,
    fechaRegistro: row.fechaRegistro,
  };
}

async function getCourseById(courseId) {
  const response = await fetch(`${COURSES_SERVICE_URL}/api/courses/${courseId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

function validatePayload(payload) {
  const requiredFields = ['nombreEstudiante', 'email', 'cursoId', 'modalidad'];
  const missingFields = requiredFields.filter((field) => !payload[field]?.toString().trim());

  if (missingFields.length > 0) {
    return `Faltan campos obligatorios: ${missingFields.join(', ')}`;
  }

  return null;
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'enrollments-service' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'enrollments-service', details: error.message });
  }
});

app.get('/api/enrollments', async (req, res) => {
  try {
    const email = req.query.email?.toString().trim();
    const status = req.query.status?.toString().trim();
    const filters = [];
    const values = [];

    if (email) {
      values.push(email);
      filters.push(`email = $${values.length}`);
    }

    if (status) {
      values.push(status);
      filters.push(`estado = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `
        SELECT
          id,
          CONCAT('INS-', LPAD(id::text, 4, '0')) AS codigo,
          nombre_estudiante AS "nombreEstudiante",
          email,
          curso_id AS "cursoId",
          curso_nombre AS "cursoNombre",
          modalidad,
          comentarios,
          estado,
          created_at AS "fechaRegistro"
        FROM enrollments
        ${whereClause}
        ORDER BY created_at DESC
      `,
      values,
    );

    res.json(rows.map(normalizeEnrollment));
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar las inscripciones.', details: error.message });
  }
});

app.get('/api/enrollments/stats/active-by-course', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          curso_nombre AS "cursoNombre",
          COUNT(*)::int AS "totalActivas"
        FROM enrollments
        WHERE estado = 'Registrado'
        GROUP BY curso_nombre
        ORDER BY "totalActivas" DESC, "cursoNombre" ASC
      `,
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar las estadisticas.', details: error.message });
  }
});

app.post('/api/enrollments', async (req, res) => {
  const validationError = validatePayload(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { nombreEstudiante, email, cursoId, modalidad, comentarios = '' } = req.body;
    const course = await getCourseById(cursoId);

    if (!course) {
      return res.status(404).json({ message: 'El curso seleccionado no existe.' });
    }

    const { rows } = await pool.query(
      `
        INSERT INTO enrollments (
          nombre_estudiante,
          email,
          curso_id,
          curso_nombre,
          modalidad,
          comentarios
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          CONCAT('INS-', LPAD(id::text, 4, '0')) AS codigo,
          nombre_estudiante AS "nombreEstudiante",
          email,
          curso_id AS "cursoId",
          curso_nombre AS "cursoNombre",
          modalidad,
          comentarios,
          estado,
          created_at AS "fechaRegistro"
      `,
      [nombreEstudiante, email, Number(cursoId), course.nombre, modalidad, comentarios],
    );

    return res.status(201).json(normalizeEnrollment(rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'Ya existe una inscripcion registrada con ese correo para el curso seleccionado.' });
    }

    return res.status(500).json({ message: 'No fue posible registrar la inscripcion.', details: error.message });
  }
});

app.patch('/api/enrollments/:id/cancel', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
        UPDATE enrollments
        SET estado = 'Cancelada'
        WHERE id = $1
        RETURNING
          id,
          CONCAT('INS-', LPAD(id::text, 4, '0')) AS codigo,
          nombre_estudiante AS "nombreEstudiante",
          email,
          curso_id AS "cursoId",
          curso_nombre AS "cursoNombre",
          modalidad,
          comentarios,
          estado,
          created_at AS "fechaRegistro"
      `,
      [Number(req.params.id)],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Inscripcion no encontrada.' });
    }

    return res.json(normalizeEnrollment(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible cancelar la inscripcion.', details: error.message });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`enrollments-service escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar enrollments-service', error);
    process.exit(1);
  });
