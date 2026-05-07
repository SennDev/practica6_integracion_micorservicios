import { bootstrapService, parseNumber } from '../lib/service-runtime.js';

const setupStatements = [
  "CREATE TABLE IF NOT EXISTS \"pets\".\"pets\" (id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, especie TEXT NOT NULL, edad TEXT NOT NULL, tamano TEXT NOT NULL, descripcion TEXT NOT NULL, imagen TEXT NOT NULL, requisitos TEXT NOT NULL)"
];

const seeds = [
  {
    "table": "pets",
    "columns": [
      "nombre",
      "especie",
      "edad",
      "tamano",
      "descripcion",
      "imagen",
      "requisitos"
    ],
    "rows": [
      [
        "Luna",
        "Gato",
        "2 anios",
        "Pequenio",
        "Gatita tranquila y carinosa ideal para interiores.",
        "https://cdn.pixabay.com/photo/2014/11/30/14/11/cat-551554_1280.jpg",
        "Casa segura, arenero y tiempo de adaptacion"
      ],
      [
        "Max",
        "Perro",
        "3 anios",
        "Mediano",
        "Perro jugueton con mucha energia para paseos diarios.",
        "https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg",
        "Patio o caminatas frecuentes, esquema de vacunacion"
      ],
      [
        "Nina",
        "Gato",
        "1 anio",
        "Pequenio",
        "Gatita curiosa, sociable y lista para convivir con familia.",
        "https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_1280.jpg",
        "Malla en ventanas, seguimiento veterinario"
      ],
      [
        "Rocky",
        "Perro",
        "4 anios",
        "Grande",
        "Perro guardian noble y obediente.",
        "https://images.dog.ceo/breeds/german-shepherd/n02106662_16149.jpg",
        "Espacio amplio y experiencia previa con perros grandes"
      ]
    ]
  }
];

await bootstrapService({
  serviceName: 'pets-service',
  schema: 'pets',
  setupStatements,
  seeds,
  registerRoutes: ({ app, pool, schema }) => {
    const table = `"${schema}"."pets"`;

    app.get('/api/pets', async (req, res, next) => {
      try {
        const filters = [];
        const values = [];

        if (req.query.especie) {
          values.push(req.query.especie);
          filters.push(`especie = $${values.length}`);
        }

        if (req.query.tamano) {
          values.push(req.query.tamano);
          filters.push(`tamano = $${values.length}`);
        }

        if (req.query.edad) {
          values.push(`%${req.query.edad}%`);
          filters.push(`edad ILIKE $${values.length}`);
        }

        const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const result = await pool.query(
          `SELECT id, nombre, especie, edad, tamano, descripcion, imagen, requisitos
           FROM ${table}
           ${whereClause}
           ORDER BY id`,
          values
        );
        res.json(result.rows);
      } catch (error) {
        next(error);
      }
    });

    app.get('/api/pets/:id', async (req, res, next) => {
      try {
        const result = await pool.query(`SELECT id, nombre, especie, edad, tamano, descripcion, imagen, requisitos FROM ${table} WHERE id = $1`, [req.params.id]);
        res.json(result.rows[0] || null);
      } catch (error) {
        next(error);
      }
    });
  },
});
