import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"orders\".\"orders\" (id SERIAL PRIMARY KEY, subtotal NUMERIC(10,2) NOT NULL, discount NUMERIC(10,2) NOT NULL, total NUMERIC(10,2) NOT NULL, pickup_time TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())",
  "CREATE TABLE IF NOT EXISTS \"orders\".\"order_items\" (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES \"orders\".\"orders\"(id) ON DELETE CASCADE, dish_id INTEGER NOT NULL, name TEXT NOT NULL, quantity INTEGER NOT NULL, price NUMERIC(10,2) NOT NULL, subtotal NUMERIC(10,2) NOT NULL)"
];

const seeds = [];

await bootstrapService({
  serviceName: 'orders-service',
  schema: 'orders',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const ordersTable = `"${schema}"."orders"`;
    const itemsTable = `"${schema}"."order_items"`;

    app.get('/api/orders', async (_req, res, next) => {
      try {
        const orders = await pool.query(`SELECT id, subtotal, discount, total, pickup_time AS "pickupTime", created_at AS "createdAt" FROM ${ordersTable} ORDER BY id DESC`);
        const items = await pool.query(`SELECT order_id AS "orderId", dish_id AS "dishId", name, quantity, price, subtotal FROM ${itemsTable} ORDER BY id`);
        const grouped = new Map();

        for (const item of items.rows) {
          const current = grouped.get(item.orderId) || [];
          current.push({ ...item, price: Number(item.price), subtotal: Number(item.subtotal) });
          grouped.set(item.orderId, current);
        }

        res.json(
          orders.rows.map((order) => ({
            ...order,
            subtotal: Number(order.subtotal),
            discount: Number(order.discount),
            total: Number(order.total),
            items: grouped.get(order.id) || [],
          }))
        );
      } catch (error) {
        next(error);
      }
    });

    app.post('/api/orders', async (req, res, next) => {
      const client = await pool.connect();
      try {
        const payload = req.body;
        await client.query('BEGIN');
        const orderResult = await client.query(
          `INSERT INTO ${ordersTable} (subtotal, discount, total, pickup_time)
           VALUES ($1, $2, $3, $4)
           RETURNING id, subtotal, discount, total, pickup_time AS "pickupTime", created_at AS "createdAt"`,
          [payload.subtotal, payload.discount, payload.total, payload.pickupTime]
        );

        const order = orderResult.rows[0];
        for (const item of payload.items || []) {
          await client.query(
            `INSERT INTO ${itemsTable} (order_id, dish_id, name, quantity, price, subtotal)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [order.id, item.dish?.id || item.dishId, item.dish?.name || item.name, item.quantity, item.dish?.price || item.price, item.subtotal]
          );
        }

        await client.query('COMMIT');
        res.status(201).json(order);
      } catch (error) {
        await client.query('ROLLBACK');
        next(error);
      } finally {
        client.release();
      }
    });
  },
});
