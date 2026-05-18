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

const seedMovies = [
  ['Duna: Parte Dos', 'Ciencia ficcion', 166, 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg', 'Paul Atreides une fuerzas con los Fremen para enfrentar una guerra por Arrakis.', 'https://www.youtube.com/watch?v=Way9Dexny3w', 95],
  ['Intensamente 2', 'Animacion', 96, 'https://image.tmdb.org/t/p/w500/aQnbNiadeGzGSjWLaXyeNxpAUIx.jpg', 'Riley crece y nuevas emociones llegan para cambiarlo todo.', 'https://www.youtube.com/watch?v=LEjhY15eCx0', 80],
  ['Godzilla y Kong: El Nuevo Imperio', 'Accion', 115, 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpKLZkyk.jpg', 'Dos titanes legendarios enfrentan una amenaza oculta en la Tierra Hueca.', 'https://www.youtube.com/watch?v=qqrpMRDuPfc', 90],
  ['Oppenheimer', 'Drama', 180, 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg', 'La historia del fisico que lidero el Proyecto Manhattan.', 'https://www.youtube.com/watch?v=uYPbbksJxIg', 85]
];

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      genre VARCHAR(60) NOT NULL,
      duration INTEGER NOT NULL,
      poster TEXT NOT NULL,
      synopsis TEXT NOT NULL,
      trailer TEXT NOT NULL,
      base_price NUMERIC(10,2) NOT NULL
    );
  `);

  for (const movie of seedMovies) {
    await pool.query(
      `INSERT INTO movies (name, genre, duration, poster, synopsis, trailer, base_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (name) DO NOTHING`,
      movie
    );
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'movies-service' }));

app.get('/movies', async (req, res) => {
  const { genre } = req.query;
  const result = genre
    ? await pool.query('SELECT * FROM movies WHERE LOWER(genre) = LOWER($1) ORDER BY name', [genre])
    : await pool.query('SELECT * FROM movies ORDER BY name');
  res.json(result.rows);
});

app.get('/movies/name/:name', async (req, res) => {
  const result = await pool.query('SELECT * FROM movies WHERE LOWER(name) = LOWER($1)', [req.params.name]);
  if (result.rowCount === 0) return res.status(404).json({ message: 'Pelicula no encontrada' });
  return res.json(result.rows[0]);
});

app.post('/movies', async (req, res) => {
  const { name, genre, duration, poster, synopsis, trailer, base_price } = req.body;
  if (!name || !genre || !duration || !poster || !synopsis || !trailer || !base_price) {
    return res.status(400).json({ message: 'Faltan datos obligatorios de la pelicula' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO movies (name, genre, duration, poster, synopsis, trailer, base_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, genre, duration, poster, synopsis, trailer, base_price]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'La pelicula ya existe' });
    return res.status(500).json({ message: 'Error al registrar pelicula' });
  }
});

initDb()
  .then(() => app.listen(port, () => console.log(`movies-service listening on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
