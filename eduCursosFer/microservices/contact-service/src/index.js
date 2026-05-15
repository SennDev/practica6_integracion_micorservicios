import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

const PORT = Number(process.env.PORT ?? 3003);
const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'educursos',
  password: process.env.DB_PASSWORD ?? 'educursos123',
  database: process.env.DB_NAME ?? 'contact_db',
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
      console.warn(`contact-service: reintentando conexion a BD (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function initializeDatabase() {
  await waitForDatabase(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        correo VARCHAR(150) NOT NULL,
        mensaje TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  });
}

function normalizeMessage(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    mensaje: row.mensaje,
    fechaRegistro: row.fechaRegistro,
  };
}

function validatePayload(payload) {
  const requiredFields = ['nombre', 'correo', 'mensaje'];
  const missingFields = requiredFields.filter((field) => !payload[field]?.toString().trim());

  if (missingFields.length > 0) {
    return `Faltan campos obligatorios: ${missingFields.join(', ')}`;
  }

  return null;
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'contact-service' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'contact-service', details: error.message });
  }
});

app.get('/api/contact/messages', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          id,
          nombre,
          correo,
          mensaje,
          created_at AS "fechaRegistro"
        FROM contact_messages
        ORDER BY created_at DESC
      `,
    );

    res.json(rows.map(normalizeMessage));
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar los mensajes.', details: error.message });
  }
});

app.post('/api/contact/messages', async (req, res) => {
  const validationError = validatePayload(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { nombre, correo, mensaje } = req.body;
    const { rows } = await pool.query(
      `
        INSERT INTO contact_messages (nombre, correo, mensaje)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          nombre,
          correo,
          mensaje,
          created_at AS "fechaRegistro"
      `,
      [nombre, correo, mensaje],
    );

    return res.status(201).json(normalizeMessage(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible registrar el mensaje.', details: error.message });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`contact-service escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar contact-service', error);
    process.exit(1);
  });
