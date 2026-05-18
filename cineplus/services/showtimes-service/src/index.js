import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const seedShowtimes = [
  ['Duna: Parte Dos', '2026-05-20', '16:00', 'Sala 1'],
  ['Duna: Parte Dos', '2026-05-20', '20:30', 'Sala 2'],
  ['Intensamente 2', '2026-05-20', '14:00', 'Sala 3'],
  ['Intensamente 2', '2026-05-21', '18:00', 'Sala 3'],
  ['Godzilla y Kong: El Nuevo Imperio', '2026-05-21', '19:30', 'Sala 1'],
  ['Oppenheimer', '2026-05-22', '20:00', 'Sala 4']
];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS showtimes (
      id SERIAL PRIMARY KEY,
      movie_name VARCHAR(120) NOT NULL,
      show_date DATE NOT NULL,
      show_time TIME NOT NULL,
      room VARCHAR(40) NOT NULL,
      UNIQUE (movie_name, show_date, show_time, room)
    );
  `);

  for (const item of seedShowtimes) {
    await pool.query(
      `INSERT INTO showtimes (movie_name, show_date, show_time, room)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (movie_name, show_date, show_time, room) DO NOTHING`,
      item
    );
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'showtimes-service' }));

app.get('/showtimes', async (req, res) => {
  const { movieName, date } = req.query;
  const filters = [];
  const values = [];

  if (movieName) {
    values.push(movieName);
    filters.push(`LOWER(movie_name) = LOWER($${values.length})`);
  }
  if (date) {
    values.push(date);
    filters.push(`show_date = $${values.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT id, movie_name, show_date, to_char(show_time, 'HH24:MI') AS show_time, room
     FROM showtimes ${where}
     ORDER BY show_date, show_time`,
    values
  );
  res.json(result.rows);
});

app.get('/showtimes/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT id, movie_name, show_date, to_char(show_time, 'HH24:MI') AS show_time, room
     FROM showtimes WHERE id = $1`,
    [req.params.id]
  );
  if (result.rowCount === 0) return res.status(404).json({ message: 'Funcion no encontrada' });
  return res.json(result.rows[0]);
});

app.post('/showtimes', async (req, res) => {
  const { movie_name, show_date, show_time, room } = req.body;
  if (!movie_name || !show_date || !show_time || !room) {
    return res.status(400).json({ message: 'Faltan datos obligatorios de la funcion' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO showtimes (movie_name, show_date, show_time, room)
       VALUES ($1, $2, $3, $4)
       RETURNING id, movie_name, show_date, to_char(show_time, 'HH24:MI') AS show_time, room`,
      [movie_name, show_date, show_time, room]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Ya existe una funcion en esa fecha, hora y sala' });
    return res.status(500).json({ message: 'Error al registrar funcion' });
  }
});

initDb()
  .then(() => app.listen(port, () => console.log(`showtimes-service listening on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
