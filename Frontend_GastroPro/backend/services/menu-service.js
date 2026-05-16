import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"menu\".\"items\" (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, price NUMERIC(10,2) NOT NULL, image TEXT NOT NULL, category TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())"
];

const seeds = [
  {
    "table": "items",
    "columns": [
      "name",
      "description",
      "price",
      "image",
      "category"
    ],
    "rows": [
      [
        "Guacamole Tradicional",
        "Aguacate fresco, pico de gallo y totopos caseros.",
        120,
        "assets/img/guacamole.jpg",
        "Entradas"
      ],
      [
        "Queso Fundido",
        "Mezcla de quesos con chorizo o champinones.",
        140,
        "assets/img/queso-fundido.jpg",
        "Entradas"
      ],
      [
        "Tacos al Pastor",
        "Orden de 5 tacos con pina, cilantro y cebolla.",
        160,
        "assets/img/tacos-pastor.jpg",
        "Platos Fuertes"
      ],
      [
        "Enchiladas Suizas",
        "Rellenas de pollo, banadas en salsa verde cremosa.",
        180,
        "assets/img/enchiladas.jpg",
        "Platos Fuertes"
      ],
      [
        "Flan Napolitano",
        "Clasico flan casero con caramelo.",
        80,
        "assets/img/flan.jpg",
        "Postres"
      ],
      [
        "Churros con Chocolate",
        "Churros crujientes con azucar y canela.",
        90,
        "assets/img/churros.jpg",
        "Postres"
      ],
      [
        "Margarita Clasica",
        "Tequila, licor de naranja y jugo de limon.",
        110,
        "assets/img/margarita.jpg",
        "Bebidas"
      ],
      [
        "Agua de Horchata",
        "Bebida refrescante de arroz con canela.",
        45,
        "assets/img/horchata.jpg",
        "Bebidas"
      ]
    ]
  }
];

await bootstrapService({
  serviceName: 'menu-service',
  schema: 'menu',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const table = `"${schema}"."items"`;

    app.get('/api/menu/items', async (req, res, next) => {
      try {
        const values = [];
        const filters = [];

        if (req.query.category) {
          values.push(req.query.category);
          filters.push(`category = $${values.length}`);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const result = await pool.query(
          `SELECT id, name, description, price, image, category
           FROM ${table}
           ${whereClause}
           ORDER BY id`,
          values
        );
        res.json(result.rows.map((row) => ({ ...row, price: Number(row.price) })));
      } catch (error) {
        next(error);
      }
    });
  },
});
