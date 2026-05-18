import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;
const seatMap = ['A', 'B', 'C', 'D'].flatMap((row) => Array.from({ length: 8 }, (_, index) => `${row}${index + 1}`));

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      showtime_id INTEGER NOT NULL,
      movie_name VARCHAR(120) NOT NULL,
      show_date DATE NOT NULL,
      show_time VARCHAR(10) NOT NULL,
      seat VARCHAR(5) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (showtime_id, seat)
    );
  `);
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'seats-service' }));

app.get('/availability/:showtimeId', async (req, res) => {
  const result = await pool.query('SELECT seat FROM reservations WHERE showtime_id = $1', [req.params.showtimeId]);
  const occupiedSeats = new Set(result.rows.map((row) => row.seat));
  res.json({
    showtime_id: Number(req.params.showtimeId),
    seats: seatMap.map((seat) => ({ seat, occupied: occupiedSeats.has(seat) }))
  });
});

app.post('/reservations', async (req, res) => {
  const { showtime_id, movie_name, show_date, show_time, seats } = req.body;
  if (!showtime_id || !movie_name || !show_date || !show_time || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'Datos de reserva incompletos' });
  }

  const invalidSeat = seats.find((seat) => !seatMap.includes(seat));
  if (invalidSeat) return res.status(400).json({ message: `Asiento invalido: ${invalidSeat}` });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      'SELECT seat FROM reservations WHERE showtime_id = $1 AND seat = ANY($2::text[])',
      [showtime_id, seats]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'Uno o mas asientos ya fueron reservados',
        occupied: existing.rows.map((row) => row.seat)
      });
    }

    const created = [];
    for (const seat of seats) {
      const result = await client.query(
        `INSERT INTO reservations (showtime_id, movie_name, show_date, show_time, seat)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [showtime_id, movie_name, show_date, show_time, seat]
      );
      created.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return res.status(201).json({
      reservation: {
        showtime_id,
        movie_name,
        show_date,
        show_time,
        seats,
        records: created
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ message: 'El asiento ya fue reservado' });
    return res.status(500).json({ message: 'Error al reservar asientos' });
  } finally {
    client.release();
  }
});

initDb()
  .then(() => app.listen(port, () => console.log(`seats-service listening on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
