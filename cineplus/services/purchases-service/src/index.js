import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;
const coupons = {
  CINE10: 0.1,
  ESTUDIANTE15: 0.15
};

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
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      movie_name VARCHAR(120) NOT NULL,
      showtime_id INTEGER NOT NULL,
      seats TEXT[] NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL,
      discount NUMERIC(10,2) NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      coupon VARCHAR(40),
      purchase_date TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      movie_name VARCHAR(120) NOT NULL,
      seat VARCHAR(5) NOT NULL,
      ticket_code VARCHAR(40) NOT NULL UNIQUE
    );
  `);
}

function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'purchases-service' }));

app.get('/coupons/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!coupons[code]) return res.status(404).json({ valid: false, message: 'Cupon no valido' });
  return res.json({ valid: true, code, discountRate: coupons[code] });
});

app.get('/purchases', async (_req, res) => {
  const result = await pool.query('SELECT * FROM purchases ORDER BY purchase_date DESC');
  res.json(result.rows);
});

app.post('/purchases', async (req, res) => {
  const { movie_name, showtime_id, seats, base_price, coupon } = req.body;
  if (!movie_name || !showtime_id || !Array.isArray(seats) || seats.length === 0 || !base_price) {
    return res.status(400).json({ message: 'Datos de compra incompletos' });
  }

  const couponCode = coupon ? String(coupon).trim().toUpperCase() : null;
  const discountRate = couponCode && coupons[couponCode] ? coupons[couponCode] : 0;
  const subtotal = money(seats.length * Number(base_price));
  const discount = money(subtotal * discountRate);
  const total = money(subtotal - discount);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const purchase = await client.query(
      `INSERT INTO purchases (movie_name, showtime_id, seats, subtotal, discount, total, coupon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [movie_name, showtime_id, seats, subtotal, discount, total, couponCode]
    );

    const tickets = [];
    for (const seat of seats) {
      const ticketCode = `CP-${purchase.rows[0].id}-${seat}-${Date.now()}`;
      const ticket = await client.query(
        `INSERT INTO tickets (purchase_id, movie_name, seat, ticket_code)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [purchase.rows[0].id, movie_name, seat, ticketCode]
      );
      tickets.push(ticket.rows[0]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ purchase: purchase.rows[0], tickets });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Error al confirmar compra' });
  } finally {
    client.release();
  }
});

initDb()
  .then(() => app.listen(port, () => console.log(`purchases-service listening on ${port}`)))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
